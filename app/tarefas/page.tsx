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

import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import "@/app/styles/calendar.css"; // LIMITA HORÁRIOS 6h–18h

// =======================
// CONFIGURAÇÃO DO LOCALIZER
// =======================
const locales = {
  "pt-BR": ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Tipo da Tarefa
type Tarefa = {
  id: string;
  titulo: string;
  relacionadoA?: {
    tipo: "lead" | "cliente";
    id: string;
    nome: string;
  };
  concluido: boolean;
  data: any; // Firestore timestamp
};

export default function TarefasPage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [aba, setAba] = useState<"lista" | "calendario">("lista");

  // =======================
  // CARREGAR TAREFAS
  // =======================
  useEffect(() => {
    const q = query(collection(db, "tarefas"), orderBy("data", "asc"));

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Tarefa[];

      setTarefas(list);
    });

    return () => unsub();
  }, []);

  const toggleConcluido = async (tarefa: Tarefa) => {
    await updateDoc(doc(db, "tarefas", tarefa.id), {
      concluido: !tarefa.concluido,
    });
  };

  // =======================
  // EVENTOS PARA O CALENDÁRIO
  // =======================
  const eventos = tarefas
    .filter((t) => t.data)
    .map((t) => {
      const start = t.data.toDate();
      const end = new Date(start.getTime() + 60 * 60 * 1000); // 1h de duração

      return {
        id: t.id,
        title: t.titulo,
        start,
        end,
      };
    });

  return (
    <Layout>
      {/* TÍTULO */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tarefas</h1>

        <Link
          href="/tarefas/novo"
          className="px-4 py-2 bg-black text-white rounded-md text-sm"
        >
          Nova Tarefa
        </Link>
      </div>

      {/* ABAS */}
      <div className="flex gap-4 mb-6 border-b pb-2">
        <button
          onClick={() => setAba("lista")}
          className={`px-4 py-2 rounded ${
            aba === "lista"
              ? "bg-black text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Lista
        </button>

        <button
          onClick={() => setAba("calendario")}
          className={`px-4 py-2 rounded ${
            aba === "calendario"
              ? "bg-black text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Calendário
        </button>
      </div>

      {/* LISTA */}
      {aba === "lista" && (
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
              {tarefas.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={t.concluido}
                      onChange={() => toggleConcluido(t)}
                    />
                  </td>

                  <td className="p-3">{t.titulo}</td>

                  <td className="p-3">
                    {t.data?.toDate?.().toLocaleString("pt-BR")}
                  </td>

                  <td className="p-3">
                    {t.relacionadoA ? (
                      <Link
                        href={`/${
                          t.relacionadoA.tipo === "lead"
                            ? "leads"
                            : "clientes"
                        }/${t.relacionadoA.id}`}
                        className="text-blue-600 underline"
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
                      className="text-blue-600 underline"
                    >
                      Abrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CALENDÁRIO */}
      {aba === "calendario" && (
        <div className="bg-white rounded-lg shadow border p-4">
          <Calendar
            localizer={localizer}
            events={eventos}
            startAccessor="start"
            endAccessor="end"
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            defaultView={Views.MONTH}
            style={{ height: 650 }}
            onSelectEvent={(e) => (window.location.href = `/tarefas/${e.id}`)}
          />
        </div>
      )}
    </Layout>
  );
}
