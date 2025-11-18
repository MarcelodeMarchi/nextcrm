"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Link from "next/link";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type Cliente = {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  criadoEm: any;
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "clientes"),
      orderBy("criadoEm", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Cliente[];
      setClientes(data);
    });

    return () => unsub();
  }, []);

  const filtrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

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

      <div className="mb-4">
        <input
          placeholder="Buscar cliente..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm w-64"
        />
      </div>

      <div className="bg-white rounded-lg shadow border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Nome</th>
              <th className="p-3">Telefone</th>
              <th className="p-3">Email</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>

          <tbody>
            {filtrados.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">{c.nome}</td>
                <td className="p-3">{c.telefone}</td>
                <td className="p-3">{c.email || "-"}</td>
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
                <td colSpan={4} className="p-4 text-center text-gray-500">
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
