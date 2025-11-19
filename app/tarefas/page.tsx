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
  updateDoc,
  doc,
} from "firebase/firestore";

// =======================
// CALENDÁRIO
// =======================
import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "pt-BR": ptBR };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// =======================
// TIPO DE TAREFA
// =======================
type Tarefa = {
  id: string;
  titulo: string;
  concluido: boolean;
  data: any;
  relacionadoA?: {
    tipo: "lead" | "cliente";
    id: string;
    nome: string;
  };
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

  // =======================
  // EVENTOS DO CALENDÁRIO
  // =======================
  const eventos = tarefas
    .filter((t) => t.data)
    .map((t) => {
      const dt = t.data.toDate();
      return {
        id: t.id,
        title: t.titulo,
        start: dt,
        end: new Date(dt.getTime() + 60 * 60 * 1000), // 1h
      };
    });

  return (
    <Layout>
      {/* CABEÇALHO */}
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

      {/* =======================
          LISTA
      ======================== */}
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

                  <td className="p-3">
                    {t.concluido ? (
                      <span className="line-through text-gray-400">
                        {t.titulo}
                      </span>
                    ) : (
                      t.titulo
                    )}
                  </td>

                  <td className="p-3">
                    {t.data?.toDate?.().toLocaleDateString("pt-BR") || "-"}
                  </td>

                  <td className="p-3">
                    {t.relacionadoA ? (
                      <Link
                        href={`/${
                          t.relacionadoA.tipo === "lead"
                            ? "leads"
                            : "clientes"
                        }/${t.relacionadoA.id}`}
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

              {tarefas.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    Nenhuma tarefa cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* =======================
          CALENDÁRIO
      ======================== */}
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

            /* HORÁRIOS 6h — 18h */
            min={new Date(2020, 1, 1, 6, 0)}
            max={new Date(2020, 1, 1, 18, 0)}
            step={30}
            timeslots={1}

            popup
            onSelectEvent={(e) =>
              (window.location.href = `/tarefas/${e.id}`)
            }
          />
        </div>
      )}
    </Layout>
  );
}
