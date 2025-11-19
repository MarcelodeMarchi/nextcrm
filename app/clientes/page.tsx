"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

type Cliente = {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  seguradora?: string;
  origem?: string;
  agente?: string;
  criadoEm?: any;
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const q = query(collection(db, "clientes"), orderBy("criadoEm", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      setClientes(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Cliente[]
      );
    });

    return () => unsub();
  }, []);

  const filtrados = clientes.filter((c) => {
    const t = busca.toLowerCase();
    return (
      c.nome?.toLowerCase().includes(t) ||
      c.telefone?.includes(t) ||
      c.email?.toLowerCase().includes(t) ||
      c.seguradora?.toLowerCase().includes(t)
    );
  });

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>

        <Link
          href="/clientes/novo"
          className="px-4 py-2 bg-black text-white rounded-md text-sm"
        >
          Novo Cliente
        </Link>
      </div>

      {/* FILTRO */}
      <input
        type="text"
        placeholder="Buscar cliente por nome, telefone, e-mail ou seguradora..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="mb-6 w-full border p-3 rounded shadow"
      />

      <div className="bg-white rounded-lg shadow border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Nome</th>
              <th className="p-3">Telefone</th>
              <th className="p-3">E-mail</th>
              <th className="p-3">Seguradora</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>

          <tbody>
            {filtrados.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-semibold">{c.nome}</td>
                <td className="p-3">{c.telefone || "-"}</td>
                <td className="p-3">{c.email || "-"}</td>
                <td className="p-3">{c.seguradora || "-"}</td>

                <td className="p-3">
                  <Link
                    href={`/clientes/${c.id}`}
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
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
