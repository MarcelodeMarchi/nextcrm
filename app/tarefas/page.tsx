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
  updateDoc,
  doc,
} from "firebase/firestore";

type Tarefa = {
  id: string;
  titulo: string;
  relacionadoA?: {
    tipo: "lead" | "cliente";
    id: string;
    nome: string;
  };
  concluido: boolean;
  data: any;
  horario?: string;
};

export default function TarefasPage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const q = query(collection(db, "tarefas"), orderBy("data", "asc"));

    const unsub = onSnapshot(q, (snap) => {
      setTarefas(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Tarefa[]
      );
    });

    return () => unsub();
  }, []);

  const toggleConcluido = async (t: Tarefa) => {
    await updateDoc(doc(db, "tarefas", t.id), {
      concluido: !t.concluido,
    });
  };

  const filtradas = tarefas.filter((t) => {
    const b = busca.toLowerCase();
    return (
      t.titulo.toLowerCase().includes(b) ||
      t.relacionadoA?.nome?.toLowerCase().includes(b) ||
      t.relacionadoA?.tipo?.toLowerCase().includes(b)
    );
  });

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tarefas</h1>

        <Link
          href="/tarefas/novo"
          className="px-4 py-2 bg-black text-white rounded-md text-sm"
        >
          Nova Tarefa
        </Link>
      </div>

      {/* FILTRO */}
      <input
        type="text"
        placeholder="Buscar tarefa por título, cliente ou lead..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="mb-6 w-full border p-3 rounded shadow"
      />

      <div className="bg-white rounded-lg shadow border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Concluir</th>
              <th className="p-3">Título</th>
              <th className="p-3">Data</th>
              <th className="p-3">Relacionado</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>

          <tbody>
            {filtradas.map((t) => (
              <tr key={t.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={t.concluido}
                    onChange={() => toggleConcluido(t)}
                  />
                </td>

                <td className="p-3 font-semibold">
                  {t.concluido ? (
                    <span className="line-through text-gray-400">{t.titulo}</span>
                  ) : (
                    t.titulo
                  )}
                </td>

                <td className="p-3">
                  {t.data?.toDate?.().toLocaleDateString("pt-BR") || "-"}{" "}
                  {t.horario ? `• ${t.horario}` : ""}
                </td>

                <td className="p-3">
                  {t.relacionadoA ? (
                    <Link
                      href={`/${t.relacionadoA.tipo === "lead" ? "leads" : "clientes"}/${t.relacionadoA.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {t.relacionadoA.nome}
                    </Link>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="p-3">
                  <Link
                    href={`/tarefas/${t.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}

            {filtradas.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Nenhuma tarefa encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
