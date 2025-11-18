"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query
} from "firebase/firestore";
import Link from "next/link";

export default function ClienteDetalhe() {
  const { id } = useParams();
  const router = useRouter();

  const [cliente, setCliente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [apolices, setApolices] = useState<any[]>([]);

  useEffect(() => {
    const carregar = async () => {
      const ref = doc(db, "clientes", id as string);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        router.replace("/clientes");
        return;
      }

      setCliente({ id, ...snap.data() });
      setLoading(false);
    };

    carregar();
  }, [id, router]);

  useEffect(() => {
    if (!id) return;

    const q = query(
      collection(db, "clientes", id as string, "apolices"),
      orderBy("inicioVigencia", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setApolices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <p>Carregando...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Cliente — {cliente.nome}</h1>

        <Link
          href={`/clientes/${cliente.id}/nova-apolice`}
          className="px-4 py-2 bg-black text-white rounded-md text-sm"
        >
          Nova Apólice
        </Link>
      </div>

      {/* Dados básicos */}
      <div className="bg-white p-4 rounded-lg shadow mb-10">
        <p><strong>Telefone:</strong> {cliente.telefone}</p>
        <p><strong>Email:</strong> {cliente.email || "—"}</p>
      </div>

      {/* Lista de Apólices */}
      <h2 className="text-xl font-bold mb-3">Apólices</h2>

      <div className="bg-white rounded-lg shadow border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Número</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Seguradora</th>
              <th className="p-3">Prêmio</th>
              <th className="p-3">Vigência</th>
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
                  {a.moeda === "USD" ? "$" : "R$"} {a.premio}
                </td>
                <td className="p-3">
                  {a.inicioVigencia?.toDate?.().toLocaleDateString()} —{" "}
                  {a.fimVigencia?.toDate?.().toLocaleDateString()}
                </td>
                <td className="p-3">
                  <Link
                    href={`/apolices/${a.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}

            {apolices.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  Nenhuma apólice cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
