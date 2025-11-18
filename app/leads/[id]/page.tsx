"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function LeadDetalhePage() {
  const { id } = useParams();
  const router = useRouter();

  const [lead, setLead] = useState<any>(null);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("novo");

  const [seguradora, setSeguradora] = useState("");
  const [origem, setOrigem] = useState("");
  const [agente, setAgente] = useState("");
  const [primeiroContato, setPrimeiroContato] = useState("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDoc(doc(db, "leads", id as string));
      if (snap.exists()) {
        const data = snap.data();
        setLead({ id, ...data });

        setNome(data.nome || "");
        setTelefone(data.telefone || "");
        setEmail(data.email || "");
        setStatus(data.status || "novo");

        setSeguradora(data.seguradora || "");
        setOrigem(data.origem || "");
        setAgente(data.agente || "");
        setPrimeiroContato(
          data.primeiroContato
            ? new Date(data.primeiroContato.seconds * 1000)
                .toISOString()
                .split("T")[0]
            : ""
        );
        setObservacoes(data.observacoes || "");
      }
    };

    fetchData();
  }, [id]);

  const salvar = async () => {
    await updateDoc(doc(db, "leads", id as string), {
      nome,
      telefone,
      email,
      status,
      seguradora,
      origem,
      agente,
      observacoes,

      primeiroContato: primeiroContato ? new Date(primeiroContato) : null,
    });

    alert("Lead atualizado com sucesso!");
    router.push("/leads");
  };

  if (!lead) return <Layout>Carregando...</Layout>;

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Lead — {lead.nome}</h1>

      <div className="grid grid-cols-2 gap-6 max-w-3xl">

        {/* Nome */}
        <div>
          <label>Nome</label>
          <input
            className="border p-2 rounded w-full"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        {/* Telefone */}
        <div>
          <label>Telefone</label>
          <input
            className="border p-2 rounded w-full"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
        </div>

        {/* Email */}
        <div>
          <label>E-mail</label>
          <input
            className="border p-2 rounded w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Status */}
        <div>
          <label>Status</label>
          <select
            className="border p-2 rounded w-full"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="novo">Novo</option>
            <option value="contato">Em Contato</option>
            <option value="proposta">Proposta</option>
            <option value="fechado">Fechado</option>
          </select>
        </div>

        {/* Seguradora com datalist */}
        <div>
          <label>Seguradora (livre, com sugestões)</label>
          <input
            list="listaSeguradoras"
            className="border p-2 rounded w-full"
            value={seguradora}
            onChange={(e) => setSeguradora(e.target.value)}
            placeholder="Ex.: Pan American"
          />

          <datalist id="listaSeguradoras">
            <option value="Pan American" />
            <option value="National" />
          </datalist>
        </div>

        {/* Origem */}
        <div>
          <label>Origem</label>
          <input
            className="border p-2 rounded w-full"
            value={origem}
            onChange={(e) => setOrigem(e.target.value)}
            placeholder="Instagram, WhatsApp..."
          />
        </div>

        {/* Agente */}
        <div>
          <label>Agente</label>
          <input
            className="border p-2 rounded w-full"
            value={agente}
            onChange={(e) => setAgente(e.target.value)}
          />
        </div>

        {/* Primeiro contato */}
        <div>
          <label>Data do 1º Contato</label>
          <input
            type="date"
            className="border p-2 rounded w-full"
            value={primeiroContato}
            onChange={(e) => setPrimeiroContato(e.target.value)}
          />
        </div>

        {/* Observações */}
        <div className="col-span-2">
          <label>Observações</label>
          <textarea
            className="border p-2 rounded w-full min-h-[120px]"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          />
        </div>

      </div>

      <button
        onClick={salvar}
        className="mt-6 px-4 py-2 bg-black text-white rounded"
      >
        Salvar Alterações
      </button>
    </Layout>
  );
}
