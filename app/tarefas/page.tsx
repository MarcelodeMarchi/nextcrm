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
  deleteDoc
} from "firebase/firestore";

import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const locales = { "pt-BR": ptBR };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

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
};

export default function TarefasPage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [aba, setAba] = useState<"lista" | "calendario">("lista");
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    const q = query(collection(db, "tarefas"), orderBy("data", "asc"));

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Tarefa[];

      setTarefas(data);
    });

    return () => unsub();
  }, []);

  const toggleConcluido = async (tarefa: Tarefa) => {
    await updateDoc(doc(db, "tarefas", tarefa.id), {
      concluido: !tarefa.concluido,
    });
  };

  const apagarTarefa = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;
    await deleteDoc(doc(db, "tarefas", id));
  };

  const eventos = tarefas
    .filter((t) => t.data)
    .map((t) => ({
      id: t.id,
      title: t.titulo,
      start: t.data.toDate(),
      end: t.data.toDate(),
      allDay: false,
    }));

  const tarefasFiltradas = tarefas.filter((t) =>
    t.titulo.toLowerCase().includes(filtro.toLowerCase())
  );

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
        <div className="bg-white rounded-lg shadow border p-4">

          {/* FILTRO */}
          <input
            type="text"
            placeholder="Filtrar tarefas..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
          />

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
              {tarefasFiltradas.map((t) => (
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
                    {t.data?.toDate?.().toLocaleString("pt-BR") || "-"}
                  </td>

                  <td className="p-3">
                    {t.relacionadoA ? (
                      <Link
                        className="text-blue-600 hover:underline"
                        href={`/${t.relacionadoA.tipo}/${t.relacionadoA.id}`}
                      >
                        {t.relacionadoA.nome}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="p-3 flex gap-3">
                    <Link
                      href={`/tarefas/${t.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Abrir
                    </Link>

                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => apagarTarefa(t.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}

              {tarefasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    Nenhuma tarefa encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CALENDÁRIO */}
      {aba === "calendario" && (
        <div className="bg-white rounded-lg shadow border p-4">
          {/* @ts-expect-error react-big-calendar aceita min/max/scrollToTime */}
          <Calendar
            {...{
              localizer,
              events: eventos,
              startAccessor: "start",
              endAccessor: "end",
              views: [Views.MONTH, Views.WEEK, Views.DAY],
              defaultView: Views.MONTH,
              style: { height: 600 },

              min: new Date(2020, 0, 1, 6, 0),
              max: new Date(2020, 0, 1, 18, 0),
              scrollToTime: new Date(2020, 0, 1, 8, 0),

              popup: true,
              onSelectEvent: (e: any) =>
                (window.location.href = `/tarefas/${e.id}`)
            }}
          />
        </div>
      )}
    </Layout>
  );
}
