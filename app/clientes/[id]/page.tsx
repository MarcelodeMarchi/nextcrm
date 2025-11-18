"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function ClientePage() {
  const { id } = useParams();
  const router = useRouter();

  const [cliente, setCliente] = useState<any>(null);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  const [seguradora, setSeguradora] = useState("");
  const [origem, setOrigem] = useState("");
  const [agente, setAgente] = useState("");

  const [primeiroContato, setPrimeiroContato] = useState("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "clientes", id as string));
      if (snap.exists()) {
        const data = snap.data();
        setCliente({ id, ...data });

        setNome(data.nome || "");
        setTelefone(data.telefone || "");
        setEmail(data.email || "");

        setSeguradora(data.seguradora || "");
        setOrigem(data.origem || "");
        setAgente(data.agente || "");

        setPrimeiroContato(
          data.primeiroContato
            ? new Date(data.primeiroContato.toDate())
                .toISOString()
                .substring(0, 10)
            : ""
        );

        setObservacoes(data.observacoes || "");
      }
    };

    load();
  }, [id]);

  const salvar = async () => {
    await updateDoc(doc(db, "clientes", id as string), {
      nome,
      telefone,
      email,
      seguradora,
      origem,
      agente,
      primeiroContato: primeiroContato ? new Date(primeiroContato) : null,
      observacoes,
      atualizadoEm: serverTimestamp(),
    });

    alert("Cliente atualizado!");
  };

  if (!cliente) return <Layout>Carregando...</Layout>;

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Cliente — {nome}</h1>

      <div className="space-y-4 max-w-xl">

        {/* Nome */}
        <div>
          <label>Nome</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        {/* Telefone */}
        <div>
          <label>Telefone</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
        </div>

        {/* Email */}
        <div>
          <label>Email</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Seguradora com sugestões */}
        <div>
          <label>Seguradora</label>
          <input
            list="lista-seguradoras"
            className="border rounded px-3 py-2 w-full"
            value={seguradora}
            onChange={(e) => setSeguradora(e.target.value)}
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
            placeholder="Ex: Instagram, Indicação..."
          />
        </div>

        {/* Agente */}
        <div>
          <label>Agente</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={agente}
            onChange={(e) => setAgente(e.target.value)}
            placeholder="Ex: Marcelo, Juliana..."
          />
        </div>

        {/* Primeiro Contato */}
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
          />
        </div>

        {/* Botão salvar */}
        <button
          onClick={salvar}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Salvar
        </button>

      </div>
    </Layout>
  );
}
