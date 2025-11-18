"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

type Apolice = {
  id: string;
  numero: string;
  tipo: string;
  seguradora: string;
  premio: number;
  moeda: string;
  refTipo: "lead" | "cliente";
  refNome: string;
  refId: string;
};

export default function ApolicesPage() {
  const [apolices, setApolices] = useState<Apolice[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "todasApolices"),
      orderBy("inicioVigencia", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setApolices(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Apolice[]
      );
    });

    return () => unsub();
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Apólices</h1>

      <div className="bg-white rounded-lg shadow border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Número</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Seguradora</th>
              <th className="p-3">Prêmio</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>

          <tbody>
            {apolices.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-3">{a.numero}</td>
                <td className="p-3">{a.tipo}</td>
                <td className="p-3">{a.seguradora}</td>
                <td className="p-3">
                  {a.moeda === "USD" ? "$" : "R$"}
                  {a.premio}
                </td>

                <td className="p-3">
                  <Link
                    className="text-blue-600 hover:underline"
                    href={`/${a.refTipo === "lead" ? "leads" : "clientes"}/${a.refId}`}
                  >
                    {a.refNome}
                  </Link>
                </td>

                <td className="p-3">
                  <Link
                    className="text-blue-600"
                    href={`/apolices/${a.id}`}
                  >
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}

            {apolices.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">
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
