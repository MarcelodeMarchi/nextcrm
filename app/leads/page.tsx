"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Link from "next/link";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Lead = {
  id: string;
  nome: string;
  telefone: string;
  status: string;
  criadoEm: any;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const q = query(collection(db, "leads"), orderBy("criadoEm", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Lead[];
      setLeads(data);
    });

    return () => unsub();
  }, []);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Leads</h1>

        <Link
          href="/leads/novo"
          className="px-4 py-2 bg-black text-white rounded-md text-sm"
        >
          Novo Lead
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Nome</th>
              <th className="p-3">Telefone</th>
              <th className="p-3">Status</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t">
                <td classname="p-3">{lead.nome}</td>
                <td classname="p-3">{lead.telefone}</td>
                <td classname="p-3">{lead.status}</td>
                <td classname="p-3">
                  <Link
                    href={`/leads/${lead.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}

            {leads.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
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
