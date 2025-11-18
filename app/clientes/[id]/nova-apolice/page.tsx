"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function NovaApoliceCliente() {
  const { id } = useParams();
  const router = useRouter();

  const [cliente, setCliente] = useState<any>(null);
  const [numero, setNumero] = useState("");
  const [tipo, setTipo] = useState("vida");
  const [seguradora, setSeguradora] = useState("");
  const [premio, setPremio] = useState("");
  const [moeda, setMoeda] = useState("USD");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [notas, setNotas] = useState("");

  useEffect(() => {
    getDoc(doc(db, "clientes", id as string)).then((snap) => {
      setCliente({ id, ...snap.data() });
    });
  }, [id]);

  const salvar = async () => {
    if (!cliente) return;

    const dataApolice = {
      numero,
      tipo,
      seguradora,
      premio: Number(premio),
      moeda,
      inicioVigencia: inicio ? new Date(inicio) : null,
      fimVigencia: fim ? new Date(fim) : null,
      notas,
      criadoEm: serverTimestamp(),

      // ligação com CLIENTE
      refTipo: "cliente",
      refId: cliente.id,
      refNome: cliente.nome,
    };

    // 1. salva na subcoleção do CLIENTE
    await addDoc(collection(db, "clientes", cliente.id, "apolices"), dataApolice);

    // ⚠️ Aqui as Firebase Functions irão sincronizar automaticamente
    // para todasApolices/{id} — não precisa fazer nada manual.

    router.push(`/clientes/${cliente.id}`);
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">
        Nova Apólice — {cliente?.nome}
      </h1>

      <div className="space-y-4 max-w-lg">

        <div>
          <label className="block text-sm">Número</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm">Seguradora</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={seguradora}
            onChange={(e) => setSeguradora(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm">Tipo</label>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Prêmio</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={premio}
              onChange={(e) => setPremio(e.target.value)}
              type="number"
            />
          </div>

          <div>
            <label className="block text-sm">Moeda</label>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Início Vigência</label>
            <input
              type="date"
              className="border rounded px-3 py-2 w-full"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm">Fim Vigência</label>
            <input
              type="date"
              className="border rounded px-3 py-2 w-full"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm">Notas</label>
          <textarea
            className="border rounded px-3 py-2 w-full"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </div>

        <button
          onClick={salvar}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Salvar Apólice
        </button>

      </div>
    </Layout>
  );
}
