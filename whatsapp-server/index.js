import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import wppconnect from "@wppconnect-team/wppconnect";

// ================================
// FIREBASE ADMIN CONFIG
// ================================

// 🔥 IMPORTANTE:
// Entre no Firebase → Configurações do Projeto → Contas de Serviço
// Gere uma chave privada JSON
// Faça upload do arquivo para o Railway como variável secreta (explicarei)
// E substitua abaixo:

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// ================================
// EXPRESS SERVER
// ================================

const app = express();
app.use(cors());
app.use(bodyParser.json());

let wppClient = null;
let qrCodeData = "";

// ================================
// WHATSAPP START
// ================================

wppconnect
  .create({
    session: "nextcrm-session",
    catchQR: (qr, asciiQR) => {
      console.log("QR RECEIVED");
      qrCodeData = qr;
    },
    headless: true,
    puppeteerOptions: {
      args: ["--no-sandbox"],
    },
  })
  .then((client) => {
    wppClient = client;

    console.log("WhatsApp conectado!");

    // Quando chegar mensagem no WhatsApp
    client.onMessage(async (message) => {
      console.log("Mensagem recebida:", message);

      // 🔥 Salvar no Firebase
      await db.collection("whatsappMensagens").add({
        de: message.from,
        corpo: message.body,
        tipo: message.type,
        data: new Date(),
      });
    });
  })
  .catch((err) => console.error("Erro ao iniciar WhatsApp:", err));

// ================================
// ROTAS API
// ================================

// Retornar QR Code (para login)
app.get("/qr", (req, res) => {
  res.json({ qr: qrCodeData });
});

// Enviar mensagem
app.post("/send", async (req, res) => {
  const { numero, mensagem } = req.body;

  if (!wppClient) return res.status(400).json({ error: "WhatsApp não conectado" });

  try {
    await wppClient.sendText(`${numero}@c.us`, mensagem);
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Falha ao enviar" });
  }
});

// ================================
// START SERVER
// ================================

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("Servidor WhatsApp rodando porta " + PORT));
