"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function NovoLeadPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [status, setStatus] = useState("novo");
  const [loading, setLoading] = useState(false);

  const salvar = async () => {
    setLoading(true);

    await addDoc(collection(db, "leads"), {
      nome,
      telefone,
      status,
      criadoEm: serverTimestamp(),
    });

    router.push("/leads");
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Novo Lead</h1>

      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium">Nome</label>
          <input
            className="border rounded-md w-full px-3 py-2"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Telefone</label>
          <input
            className="border rounded-md w-full px-3 py-2"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            className="border rounded-md w-full px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="novo">Novo</option>
            <option value="contatado">Contatado</option>
            <option value="em_proposta">Em Proposta</option>
            <option value="fechado">Fechado</option>
            <option value="perdido">Perdido</option>
          </select>
        </div>

        <button
          onClick={salvar}
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded-md"
        >
          {loading ? "Salvando..." : "Salvar Lead"}
        </button>
      </div>
    </Layout>
  );
}
