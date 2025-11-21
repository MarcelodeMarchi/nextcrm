"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

type Apolice = {
  id: string;
  numero?: string;
  refNome?: string;
  seguradora?: string;
  ramo?: string;
  inicioVigencia?: any; 
  fimVigencia?: any; 
};

export default function ApolicesPage() {
  const [apolices, setApolices] = useState<Apolice[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    // 🔥 GARANTE QUE NUNCA QUEBRA MESMO SEM DATAS
    const q = query(collection(db, "todasApolices"), orderBy("numero", "asc"));

    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));

      setApolices(lista);
    });

    return () => unsub();
  }, []);

  const termo = busca.toLowerCase();

  const filtradas = apolices.filter((a) => {
    return (
      a.numero?.toLowerCase().includes(termo) ||
      a.refNome?.toLowerCase().includes(termo) ||
      a.seguradora?.toLowerCase().includes(termo) ||
      a.ramo?.toLowerCase().includes(termo)
    );
  });

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Apólices</h1>

        <Link
          href="/apolices/nova"
          className="px-4 py-2 bg-black text-white rounded-md text-sm"
        >
          Nova Apólice
        </Link>
      </div>

      <input
        type="text"
        placeholder="Buscar por número, cliente, seguradora..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="mb-4 w-full border px-3 py-2 rounded-md shadow-sm"
      />

      <div className="bg-white rounded-lg shadow border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Número</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Seguradora</th>
              <th className="p-3">Vigência</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>

          <tbody>
            {filtradas.map((a) => {
              const ini = a.inicioVigencia?.toDate?.();
              const fim = a.fimVigencia?.toDate?.();

              const vig =
                ini && fim
                  ? `${ini.toLocaleDateString("pt-BR")} — ${fim.toLocaleDateString("pt-BR")}`
                  : "-";

              return (
                <tr key={a.id} className="border-t">
                  <td className="p-3">{a.numero || "-"}</td>
                  <td className="p-3">{a.refNome || "-"}</td>
                  <td className="p-3">{a.seguradora || "-"}</td>
                  <td className="p-3">{vig}</td>
                  <td className="p-3">
                    <Link
                      href={`/apolices/${a.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Abrir
                    </Link>
                  </td>
                </tr>
              );
            })}

            {filtradas.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-4 text-center text-gray-500 text-sm"
                >
                  Nenhuma apólice encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
