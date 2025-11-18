/**
 * NEXT CRM - Firebase Functions (v2)
 * Sincronização automática de apólices + alerta de renovação
 */

const {
  onDocumentCreated,
  onDocumentUpdated,
  onDocumentDeleted,
} = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/* --------------------------------------------------------------------
   🔄 SYNC: Criar apólice (V2)
-------------------------------------------------------------------- */
exports.syncApoliceCreate = onDocumentCreated(
  {
    document: "{tipo}/{refId}/apolices/{apoliceId}",
    region: "us-central1",
  },
  async (event) => {
    const data = event.data.data();
    const params = event.params;

    const apoliceId = params.apoliceId;
    const tipo = params.tipo; // leads ou clientes
    const refId = params.refId;

    await db.collection("todasApolices").doc(apoliceId).set({
      ...data,
      refTipo: tipo === "leads" ? "lead" : "cliente",
      refId: refId,
      refNome: data.refNome || "", // <-- IMPORTANTE
    });

    console.log("✔ Apólice sincronizada (CREATE):", apoliceId);
  }
);

/* --------------------------------------------------------------------
   🔄 SYNC: Atualizar apólice (V2)
-------------------------------------------------------------------- */
exports.syncApoliceUpdate = onDocumentUpdated(
  {
    document: "{tipo}/{refId}/apolices/{apoliceId}",
    region: "us-central1",
  },
  async (event) => {
    const novo = event.data.after.data();
    const params = event.params;

    const apoliceId = params.apoliceId;
    const tipo = params.tipo;
    const refId = params.refId;

    await db.collection("todasApolices").doc(apoliceId).update({
      ...novo,
      refTipo: tipo === "leads" ? "lead" : "cliente",
      refId: refId,
      refNome: novo.refNome || "", // <-- IMPORTANTE
    });

    console.log("✔ Apólice sincronizada (UPDATE):", apoliceId);
  }
);

/* --------------------------------------------------------------------
   🔄 SYNC: Deletar apólice (V2)
-------------------------------------------------------------------- */
exports.syncApoliceDelete = onDocumentDeleted(
  {
    document: "{tipo}/{refId}/apolices/{apoliceId}",
    region: "us-central1",
  },
  async (event) => {
    const apoliceId = event.params.apoliceId;

    await db.collection("todasApolices").doc(apoliceId).delete();

    console.log("✔ Apólice removida (DELETE):", apoliceId);
  }
);

/* --------------------------------------------------------------------
   ⏰ ALERTA DE RENOVAÇÃO (V2)
   Executa diariamente às 05:00 NYC time
-------------------------------------------------------------------- */
exports.alertaRenovacao = onSchedule(
  {
    schedule: "0 5 * * *",
    timeZone: "America/New_York",
    region: "us-central1",
  },
  async () => {
    const hoje = new Date();
    const limite = new Date();
    limite.setDate(limite.getDate() + 30);

    const snap = await db
      .collection("todasApolices")
      .where("fimVigencia", ">=", hoje)
      .where("fimVigencia", "<=", limite)
      .get();

    const renovacoes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    console.log("🔔 Apólices em renovação (30 dias):", renovacoes.length);

    for (const ap of renovacoes) {
      await db.collection("tarefas").add({
        titulo: `Renovação: ${ap.numero} — ${ap.refNome}`,
        concluido: false,
        data: ap.fimVigencia,
        criadoEm: admin.firestore.FieldValue.serverTimestamp(),
        relacionadoA: {
          tipo: ap.refTipo,
          id: ap.refId,
          nome: ap.refNome,
        },
      });
    }
  }
);
