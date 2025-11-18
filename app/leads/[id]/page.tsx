"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/Layout";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import Link from "next/link";

export default function LeadPage() {
  const { id } = useParams();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Campos editáveis
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [origem, setOrigem] = useState("");
  const [seguradora, setSeguradora] = useState("");
  const [agente, setAgente] = useState("");
  const [primeiroContato, setPrimeiroContato] = useState(""); // NOVO
  const [observacoes, setObservacoes] = useState(""); // NOVO

  useEffect(() => {
    if (!id) return;

    getDoc(doc(db, "leads", id as string)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();

        setLead({ id, ...data });

        setNome(data.nome || "");
        setTelefone(data.telefone || "");
        setEmail(data.email || "");
        setOrigem(data.origem || "");
        setSeguradora(data.seguradora || "");
        setAgente(data.agente || "");
        setPrimeiroContato(data.primeiroContato || "");
        setObservacoes(data.observacoes || "");
      }

      setLoading(false);
    });
  }, [id]);

  const salvar = async () => {
    await updateDoc(doc(db, "leads", id as string), {
      nome,
      telefone,
      email,
      origem,
      seguradora,
      agente,
      primeiroContato,
      observacoes,
    });

    alert("Lead atualizado!");
  };

  if (loading) return <Layout>Carregando...</Layout>;
  if (!lead) return <Layout>Lead não encontrado.</Layout>;

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Lead: {lead.nome}</h1>

      <div className="bg-white p-5 rounded shadow max-w-xl space-y-4">

        {/* Nome */}
        <div>
          <label className="block mb-1 font-semibold">Nome</label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="border rounded p-2 w-full"
          />
        </div>

        {/* Telefone */}
        <div>
          <label className="block mb-1 font-semibold">Telefone</label>
          <input
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="border rounded p-2 w-full"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1 font-semibold">E-mail</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded p-2 w-full"
          />
        </div>

        {/* Origem */}
        <div>
          <label className="block mb-1 font-semibold">Origem</label>
          <select
            value={origem}
            onChange={(e) => setOrigem(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="">Selecione</option>
            <option value="Instagram">Instagram</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Indicação">Indicação</option>
          </select>
        </div>

        {/* Seguradora */}
        <div>
          <label className="block mb-1 font-semibold">Seguradora</label>
          <select
            value={seguradora}
            onChange={(e) => setSeguradora(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="">Selecione</option>
            <option value="Prudential">Prudential</option>
            <option value="Metlife">Metlife</option>
            <option value="AIG">AIG</option>
          </select>
        </div>

        {/* Agente */}
        <div>
          <label className="block mb-1 font-semibold">Agente</label>
          <select
            value={agente}
            onChange={(e) => setAgente(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="">Selecione</option>
            <option value="Marcelo">Marcelo</option>
            <option value="Juliana">Juliana</option>
          </select>
        </div>

        {/* 📅 Data do Primeiro Contato */}
        <div>
          <label className="block mb-1 font-semibold">
            Data do Primeiro Contato
          </label>
          <input
            type="date"
            value={primeiroContato}
            onChange={(e) => setPrimeiroContato(e.target.value)}
            className="border rounded p-2 w-full"
          />
        </div>

        {/* 📝 Observações */}
        <div>
          <label className="block mb-1 font-semibold">Observações</label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={4}
            className="border rounded p-2 w-full"
          />
        </div>

        {/* Botão salvar */}
        <button
          onClick={salvar}
          className="bg-black text-white px-4 py-2 rounded w-full"
        >
          Salvar Alterações
        </button>
      </div>

      <div className="mt-6">
        <Link
          href={`/leads/${id}/nova-apolice`}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          ➕ Criar Nova Apólice
        </Link>
      </div>
    </Layout>
  );
}
