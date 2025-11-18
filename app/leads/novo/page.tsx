"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function NovoLeadPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  const [seguradora, setSeguradora] = useState("");
  const [origem, setOrigem] = useState("");
  const [agente, setAgente] = useState("");

  const [primeiroContato, setPrimeiroContato] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const salvar = async () => {
    const docRef = await addDoc(collection(db, "leads"), {
      nome,
      telefone,
      email,
      seguradora,
      origem,
      agente,
      primeiroContato: primeiroContato ? new Date(primeiroContato) : null,
      observacoes,

      status: "novo",
      ordem: 0,
      criadoEm: serverTimestamp(),
    });

    router.push(`/leads/${docRef.id}`);
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Novo Lead</h1>

      <div className="space-y-4 max-w-xl">

        {/* Nome */}
        <div>
          <label>Nome</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Digite o nome"
          />
        </div>

        {/* Telefone */}
        <div>
          <label>Telefone</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(11) 99999-9999"
          />
        </div>

        {/* Email */}
        <div>
          <label>Email</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
          />
        </div>

        {/* Seguradora */}
        <div>
          <label>Seguradora</label>
          <input
            list="lista-seguradoras"
            className="border rounded px-3 py-2 w-full"
            value={seguradora}
            onChange={(e) => setSeguradora(e.target.value)}
            placeholder="Digite ou selecione"
          />
          <datalist id="lista-seguradoras">
            <option value="Pan American" />
            <option value="National" />
          </datalist>
        </div>

        {/* Origem */}
        <div>
          <label>Origem</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={origem}
            onChange={(e) => setOrigem(e.target.value)}
            placeholder="Instagram, Indicação, WhatsApp..."
          />
        </div>

        {/* Agente */}
        <div>
          <label>Agente</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={agente}
            onChange={(e) => setAgente(e.target.value)}
            placeholder="Marcelo, Juliana..."
          />
        </div>

        {/* Primeiro contato */}
        <div>
          <label>Data do primeiro contato</label>
          <input
            type="date"
            className="border rounded px-3 py-2 w-full"
            value={primeiroContato}
            onChange={(e) => setPrimeiroContato(e.target.value)}
          />
        </div>

        {/* Observações */}
        <div>
          <label>Observações</label>
          <textarea
            className="border rounded px-3 py-2 w-full"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Qualquer observação sobre o lead"
          />
        </div>

        {/* Botão salvar */}
        <button
          onClick={salvar}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Criar Lead
        </button>

      </div>
    </Layout>
  );
}
