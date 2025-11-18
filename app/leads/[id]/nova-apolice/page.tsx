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

export default function NovaApoliceLead() {
  const { id } = useParams();
  const router = useRouter();

  const [lead, setLead] = useState<any>(null);
  const [numero, setNumero] = useState("");
  const [tipo, setTipo] = useState("vida");
  const [seguradora, setSeguradora] = useState("");
  const [premio, setPremio] = useState("");
  const [moeda, setMoeda] = useState("USD");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [notas, setNotas] = useState("");

  useEffect(() => {
    getDoc(doc(db, "leads", id as string)).then((snap) => {
      setLead({ id, ...snap.data() });
    });
  }, [id]);

  const salvar = async () => {
    if (!lead) return;

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

      // ligação com lead
      refTipo: "lead",
      refId: lead.id,
      refNome: lead.nome,
    };

    // 1. salva na subcoleção do lead
    await addDoc(collection(db, "leads", lead.id, "apolices"), dataApolice);

    // functions sincronizam automaticamente

    router.push(`/leads/${lead.id}`);
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">
        Nova Apólice — {lead?.nome}
      </h1>

      <div className="space-y-4 max-w-lg">

        <div>
          <label>Número</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
        </div>

        <div>
          <label>Seguradora</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={seguradora}
            onChange={(e) => setSeguradora(e.target.value)}
          />
        </div>

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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Início Vigência</label>
            <input
              type="date"
              className="border rounded px-3 py-2 w-full"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
            />
          </div>
          <div>
            <label>Fim Vigência</label>
            <input
              type="date"
              className="border rounded px-3 py-2 w-full"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label>Notas</label>
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

export default function NovaApoliceLead() {
  const { id } = useParams();
  const router = useRouter();

  const [lead, setLead] = useState<any>(null);
  const [numero, setNumero] = useState("");
  const [tipo, setTipo] = useState("vida");
  const [seguradora, setSeguradora] = useState("");
  const [premio, setPremio] = useState("");
  const [moeda, setMoeda] = useState("USD");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [notas, setNotas] = useState("");

  useEffect(() => {
    getDoc(doc(db, "leads", id as string)).then((snap) => {
      setLead({ id, ...snap.data() });
    });
  }, [id]);

  const salvar = async () => {
    if (!lead) return;

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

      // ligação com lead
      refTipo: "lead",
      refId: lead.id,
      refNome: lead.nome,
    };

    // 1. salva na subcoleção do lead
    await addDoc(collection(db, "leads", lead.id, "apolices"), dataApolice);

    // functions sincronizam automaticamente

    router.push(`/leads/${lead.id}`);
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">
        Nova Apólice — {lead?.nome}
      </h1>

      <div className="space-y-4 max-w-lg">

        <div>
          <label>Número</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
        </div>

        <div>
          <label>Seguradora</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={seguradora}
            onChange={(e) => setSeguradora(e.target.value)}
          />
        </div>

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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Início Vigência</label>
            <input
              type="date"
              className="border rounded px-3 py-2 w-full"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
            />
          </div>
          <div>
            <label>Fim Vigência</label>
            <input
              type="date"
              className="border rounded px-3 py-2 w-full"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label>Notas</label>
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
