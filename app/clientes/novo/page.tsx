"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Layout from "@/components/Layout";
import { useRouter } from "next/navigation";

export default function NovoClientePage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  const salvar = async () => {
    await addDoc(collection(db, "clientes"), {
      nome,
      telefone,
      email,
      criadoEm: serverTimestamp(),
    });
    router.push("/clientes");
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Novo Cliente</h1>

      <div className="grid grid-cols-1 gap-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium">Nome</label>
          <input
            className="border rounded-md px-3 py-2 w-full"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Telefone</label>
          <input
            className="border rounded-md px-3 py-2 w-full"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">E-mail</label>
          <input
            className="border rounded-md px-3 py-2 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          onClick={salvar}
          className="px-4 py-2 bg-black text-white rounded-md"
        >
          Salvar Cliente
        </button>
      </div>
    </Layout>
  );
}
