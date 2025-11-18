"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";

import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

export default function LeadPage() {
  const { id } = useParams();
  const router = useRouter();

  const [lead, setLead] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "leads", id as string));
      if (snap.exists()) {
        setLead({ id, ...snap.data() });
      }
    };

    load();
  }, [id]);

  const salvar = async () => {
    if (!lead) return;

    await updateDoc(doc(db, "leads", id as string), {
      nome: lead.nome || "",
      telefone: lead.telefone || "",
      email: lead.email || "",
      seguradora: lead.seguradora || "",
      origem: lead.origem || "",
      agente: lead.agente || "",
      status: lead.status || "novo",
      primeiroContato: lead.primeiroContato || null,
      observacoes: lead.observacoes || "",
    });

    alert("Lead atualizado com sucesso!");
  };

  const excluir = async () => {
    if (!confirm("Tem certeza que deseja excluir este lead?")) return;

    await deleteDoc(doc(db, "leads", id as string));

    alert("Lead excluído com sucesso!");
    router.push("/leads");
  };

  if (!lead) return <Layout>Carregando lead...</Layout>;

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Lead — {lead.nome}</h1>

      <div className="space-y-4 max-w-xl bg-white border shadow p-4 rounded">

        {/* NOME */}
        <div>
          <label>Nome</label>
          <input
            className="border rounded w-full p-2"
            value={lead.nome}
            onChange={(e) => setLead({ ...lead, nome: e.target.value })}
          />
        </div>

        {/* TELEFONE */}
        <div>
          <label>Telefone</label>
          <input
            className="border rounded w-full p-2"
            value={lead.telefone}
            onChange={(e) => setLead({ ...lead, telefone: e.target.value })}
          />
        </div>

        {/* EMAIL */}
        <div>
          <label>Email</label>
          <input
            className="border rounded w-full p-2"
            value={lead.email}
            onChange={(e) => setLead({ ...lead, email: e.target.value })}
          />
        </div>

        {/* SEGURADORA */}
        <div>
          <label>Seguradora</label>
          <select
            className="border rounded w-full p-2"
            value={lead.seguradora}
            onChange={(e) => setLead({ ...lead, seguradora: e.target.value })}
          >
            <option value="">Selecionar</option>
            <option value="Pan American">Pan American</option>
            <option value="National">National</option>
          </select>
        </div>

        {/* STATUS */}
        <div>
          <label>Status</label>
          <select
            className="border rounded w-full p-2"
            value={lead.status}
            onChange={(e) => setLead({ ...lead, status: e.target.value })}
          >
            <option value="novo">Novo</option>
            <option value="contato">Em Contato</option>
            <option value="proposta">Proposta</option>
            <option value="fechado">Fechado</option>
          </select>
          <p className="text-xs text-gray-500">
            Quando definir como <strong>Fechado</strong>, o sistema criará automaticamente um cliente.
          </p>
        </div>

        {/* PRIMEIRO CONTATO */}
        <div>
          <label>Data do Primeiro Contato</label>
          <input
            type="date"
            className="border rounded w-full p-2"
            value={lead.primeiroContato || ""}
            onChange={(e) =>
              setLead({ ...lead, primeiroContato: e.target.value })
            }
          />
        </div>

        {/* OBSERVAÇÕES */}
        <div>
          <label>Observações</label>
          <textarea
            className="border rounded w-full p-2"
            rows={4}
            value={lead.observacoes}
            onChange={(e) =>
              setLead({ ...lead, observacoes: e.target.value })
            }
          />
        </div>

        {/* BOTÕES */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={salvar}
            className="px-4 py-2 rounded bg-black text-white"
          >
            Salvar
          </button>

          <button
            onClick={excluir}
            className="px-4 py-2 rounded bg-red-600 text-white"
          >
            Excluir Lead
          </button>
        </div>
      </div>
    </Layout>
  );
}
