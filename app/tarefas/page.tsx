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

import "react-big-calendar/lib/css/react-big-calendar.css";

// =======================
// CONFIGURAÇÃO DO CALENDÁRIO
// =======================
const locales = { "pt-BR": ptBR };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// =======================
// TIPO TAREFA
// =======================
type Tarefa = {
  id: string;
  titulo: string;
  horario?: string;
  concluido: boolean;
  data: any; // Timestamp Firestore
};

export default function TarefasPage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [aba, setAba] = useState<"lista" | "calendario">("lista");
  const [filtro, setFiltro] = useState("");

  // =======================
  // CARREGA TAREFAS
  // =======================
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

  // =======================
  // Marcar como concluída
  // =======================
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
      const dataBase = t.data?.toDate ? t.data.toDate() : new Date(t.data);

      let inicio = dataBase;
      let fim = new Date(dataBase);

      if (t.horario) {
        const [h, m] = t.horario.split(":");
        inicio = new Date(dataBase.setHours(Number(h), Number(m), 0));
        fim = new Date(inicio.getTime() + 60 * 60 * 1000); // +1h
      }

      return {
        id: t.id,
        title: t.titulo,
        start: inicio,
        end: fim,
        allDay: !t.horario,
      };
    });

  // =======================
  // FILTRO LISTA
  // =======================
  const tarefasFiltradas = tarefas.filter((t) =>
    t.titulo.toLowerCase().includes(filtro.toLowerCase())
  );

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

      {/* ==========================
          ABA — LISTA
      =========================== */}
      {aba === "lista" && (
        <>
          {/* FILTRO */}
          <input
            type="text"
            placeholder="Buscar tarefa..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="mb-4 border p-2 rounded w-full shadow-sm"
          />

          <div className="bg-white rounded-lg shadow border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3">✔</th>
                  <th className="p-3">Título</th>
                  <th className="p-3">Data</th>
                  <th className="p-3">Horário</th>
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
                        <span className="line-through text-gray-400">{t.titulo}</span>
                      ) : (
                        t.titulo
                      )}
                    </td>

                    <td className="p-3">
                      {t.data?.toDate?.().toLocaleDateString("pt-BR") || "-"}
                    </td>

                    <td className="p-3">
                      {t.horario || "-"}
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
        </>
      )}

      {/* ==========================
          ABA — CALENDÁRIO
      =========================== */}
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
            popup
            onSelectEvent={(e) => (window.location.href = `/tarefas/${e.id}`)}
          />
        </div>
      )}
    </Layout>
  );
}
