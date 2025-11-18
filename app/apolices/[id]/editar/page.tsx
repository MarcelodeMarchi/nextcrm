"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

// 🔹 Tipo da Apólice
type Apolice = {
  id: string;
  numero: string;
  tipo: string;
  seguradora: string;
  premio: number;
  moeda: string;
  inicioVigencia: any;
  fimVigencia: any;
  notas?: string;
  refTipo: "lead" | "cliente";
  refId: string;
};

export default function EditarApolice() {
  const { id } = useParams();
  const router = useRouter();

  const [apolice, setApolice] = useState<Apolice | null>(null);
  const [cliente, setCliente] = useState<any>(null);

  // Campos editáveis
  const [numero, setNumero] = useState("");
  const [tipo, setTipo] = useState("vida");
  const [seguradora, setSeguradora] = useState("");
  const [premio, setPremio] = useState("");
  const [moeda, setMoeda] = useState("USD");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [notas, setNotas] = useState("");

  useEffect(() => {
    const load = async () => {
      const ref = doc(db, "todasApolices", id as string);
      const snap = await getDoc(ref);

      if (!snap.exists()) return;

      const dados = snap.data() as Apolice;
      const ap = { id: id as string, ...dados };

      setApolice(ap);

      // Preencher campos com segurança
      setNumero(ap.numero || "");
      setTipo(ap.tipo || "vida");
      setSeguradora(ap.seguradora || "");
      setPremio(String(ap.premio || ""));
      setMoeda(ap.moeda || "USD");

      setInicio(
        ap.inicioVigencia
          ? new Date(ap.inicioVigencia.toDate()).toISOString().slice(0, 10)
          : ""
      );

      setFim(
        ap.fimVigencia
          ? new Date(ap.fimVigencia.toDate()).toISOString().slice(0, 10)
          : ""
      );

      setNotas(ap.notas || "");

      // Carregar cliente / lead vinculado
      if (ap.refTipo && ap.refId) {
        const col = ap.refTipo === "lead" ? "leads" : "clientes";
        const snapC = await getDoc(doc(db, col, ap.refId));

        if (snapC.exists()) {
          setCliente({ id: ap.refId, ...snapC.data() });
        }
      }
    };

    load();
  }, [id]);

  const salvar = async () => {
    if (!apolice) return;

    const atualizado = {
      numero,
      tipo,
      seguradora,
      premio: Number(premio),
      moeda,
      inicioVigencia: inicio ? new Date(inicio) : null,
      fimVigencia: fim ? new Date(fim) : null,
      notas,
    };

    // Atualizar coleção global
    await updateDoc(doc(db, "todasApolices", id as string), atualizado);

    // Atualizar subcoleção (cliente/lead)
    const col = apolice.refTipo === "lead" ? "leads" : "clientes";

    await updateDoc(
      doc(db, col, apolice.refId, "apolices", id as string),
      atualizado
    );

    alert("Apólice atualizada com sucesso!");
    router.push(`/apolices/${id}`);
  };

  if (!apolice) return <Layout>Carregando...</Layout>;

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Editar Apólice</h1>

      <div className="bg-white border rounded shadow p-4 space-y-4 max-w-xl">

        {/* Número */}
        <div>
          <label>Número</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
        </div>

        {/* Tipo */}
        <div>
          <label>Tipo</label>
          <select
            className="border rounded px-3 py-2 w-full"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="vida">Vida</option>
            <option value="saude">Saúde</option>
            <option value="residencial">Residencial</option>
            <option value="comercial">Comercial</option>
          </select>
        </div>

        {/* Seguradora */}
        <div>
          <label>Seguradora</label>
          <input
            list="seguradoras"
            className="border rounded px-3 py-2 w-full"
            value={seguradora}
            onChange={(e) => setSeguradora(e.target.value)}
          />

          <datalist id="seguradoras">
            <option value="Pan American" />
            <option value="National" />
          </datalist>
        </div>

        {/* Prêmio / moeda */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Prêmio</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={premio}
              onChange={(e) => setPremio(e.target.value)}
            />
          </div>

          <div>
            <label>Moeda</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={moeda}
              onChange={(e) => setMoeda(e.target.value)}
            >
              <option value="USD">USD</option>
              <option value="BRL">BRL</option>
            </select>
          </div>
        </div>

        {/* Vigência */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Início da Vigência</label>
            <input
              type="date"
              className="border rounded px-3 py-2 w-full"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
            />
          </div>

          <div>
            <label>Fim da Vigência</label>
            <input
              type="date"
              className="border rounded px-3 py-2 w-full"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
            />
          </div>
        </div>

        {/* Notas */}
        <div>
          <label>Notas</label>
          <textarea
            className="border rounded px-3 py-2 w-full"
            rows={4}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <button
            onClick={salvar}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Salvar
          </button>

          <button
            onClick={() => router.push(`/apolices/${id}`)}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Layout>
  );
}
