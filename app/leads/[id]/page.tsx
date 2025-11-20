"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function LeadPage() {
  const { id } = useParams();
  const router = useRouter();

  const [lead, setLead] = useState<any>(null);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    const carregar = async () => {
      const ref = doc(db, "leads", id as string);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        router.replace("/leads");
        return;
      }

      setLead({ id, ...snap.data() });
    };

    carregar();
  }, [id, router]);

  const salvar = async () => {
    await updateDoc(doc(db, "leads", id as string), lead);
    alert("Lead salvo com sucesso!");
    setEditando(false);
  };

  if (!lead) {
    return (
      <Layout>
        <p>Carregando...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Lead</h1>

      <div className="bg-white border rounded shadow p-6 space-y-4 max-w-xl">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium">Nome</label>
          <input
            className="border rounded px-3 py-2 w-full"
            disabled={!editando}
            value={lead.nome}
            onChange={(e) => setLead({ ...lead, nome: e.target.value })}
          />
        </div>

        {/* Telefone */}
        <div>
          <label className="block text-sm font-medium">Telefone</label>
          <input
            className="border rounded px-3 py-2 w-full"
            disabled={!editando}
            value={lead.telefone}
            onChange={(e) => setLead({ ...lead, telefone: e.target.value })}
          />

          <button
            onClick={() => {
              const numero = lead.telefone.replace(/\D/g, "");
              window.open(`https://wa.me/1${numero}`, "_blank");
            }}
            className="mt-1 text-green-600 underline text-sm"
          >
            Abrir WhatsApp
          </button>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            className="border rounded px-3 py-2 w-full"
            disabled={!editando}
            value={lead.email}
            onChange={(e) => setLead({ ...lead, email: e.target.value })}
          />
        </div>

        {/* Seguradora */}
        <div>
          <label className="block text-sm font-medium">Seguradora</label>
          <input
            className="border rounded px-3 py-2 w-full"
            disabled={!editando}
            value={lead.seguradora || ""}
            onChange={(e) => setLead({ ...lead, seguradora: e.target.value })}
          />
        </div>

        {/* Origem */}
        <div>
          <label className="block text-sm font-medium">Origem</label>
          <input
            className="border rounded px-3 py-2 w-full"
            disabled={!editando}
            value={lead.origem || ""}
            onChange={(e) => setLead({ ...lead, origem: e.target.value })}
          />
        </div>

        {/* Agente */}
        <div>
          <label className="block text-sm font-medium">Agente</label>
          <input
            className="border rounded px-3 py-2 w-full"
            disabled={!editando}
            value={lead.agente || ""}
            onChange={(e) => setLead({ ...lead, agente: e.target.value })}
          />
        </div>

        {/* Botões */}
        <div className="flex gap-3 mt-4">
          {!editando ? (
            <button
              onClick={() => setEditando(true)}
              className="px-4 py-2 bg-black text-white rounded"
            >
              Editar
            </button>
          ) : (
            <button
              onClick={salvar}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Salvar
            </button>
          )}

          <button
            onClick={() => router.push("/leads")}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Voltar
          </button>
        </div>
      </div>
    </Layout>
  );
}
