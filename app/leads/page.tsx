"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

import WhatsAppButton from "@/components/WhatsAppButton";

type Lead = {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  seguradora?: string;
  origem?: string;
  agente?: string;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const q = query(collection(db, "leads"), orderBy("nome", "asc"));

    const unsub = onSnapshot(q, (snap) => {
      setLeads(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Lead[]
      );
    });

    return () => unsub();
  }, []);

  const filtrados = leads.filter((l) => {
    const t = busca.toLowerCase();
    return (
      l.nome?.toLowerCase().includes(t) ||
      l.telefone?.includes(t) ||
      l.email?.toLowerCase().includes(t)
    );
  });

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Leads</h1>

      <input
        type="text"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar lead..."
        className="mb-6 w-full border rounded px-4 py-2 shadow"
      />

      <div className="bg-white shadow rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Telefone</th>
              <th className="p-3">Email</th>
              <th className="p-3">WhatsApp</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>

          <tbody>
            {filtrados.map((lead) => (
              <tr key={lead.id} className="border-t">
                <td className="p-3 font-semibold">{lead.nome}</td>
                <td className="p-3">{lead.telefone || "—"}</td>
                <td className="p-3">{lead.email || "—"}</td>

                {/* BOTÃO WHATSAPP */}
                <td className="p-3">
                  <WhatsAppButton phone={lead.telefone} />
                </td>

                <td className="p-3">
                  <Link
                    href={`/leads/${lead.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}

            {filtrados.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Nenhum lead encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
