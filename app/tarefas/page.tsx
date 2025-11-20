"use client";

import { useEffect, useState, useMemo } from "react";
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

import {
  Calendar,
  Views,
  dateFnsLocalizer,
} from "react-big-calendar";

import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";

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
// HELPER — Corrigir timezone America/New_York
// =======================
const fixTimezone = (dt: any) => {
  try {
    if (!dt) return null;
    if (dt?.toDate) dt = dt.toDate();

    const iso = dt.toISOString().replace("Z", "");
    return new Date(iso);
  } catch {
    return dt;
  }
};

// =======================
// TIPAGENS
// =======================
type Tarefa = {
  id: string;
  titulo: string;
  concluido: boolean;
  data: any;
  horario?: string;
  relacionadoA?: {
    tipo: "lead" | "cliente";
    id: string;
    nome: string;
  };
};

export default function TarefasPage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [aba, setAba] = useState<"lista" | "calendario">("lista");
  const [busca, setBusca] = useState("");

  // =======================
  // CARREGAR TAREFAS
  // =======================
  useEffect(() => {
    const q = query(collection(db, "tarefas"), orderBy("data", "asc"));

    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Tarefa[];

      setTarefas(lista);
    });

    return () => unsub();
  }, []);

  // =======================
  // FILTRO
  // =======================
  const tarefasFiltradas = tarefas.filter((t) => {
    const termo = busca.toLowerCase();
    return (
      t.titulo?.toLowerCase().includes(termo) ||
      t.relacionadoA?.nome?.toLowerCase().includes(termo)
    );
  });

  // =======================
  // EVENTOS PARA O CALENDÁRIO
  // =======================
  const eventos = useMemo(() => {
    return tarefas
      .filter((t) => t.data)
      .map((t) => {
        const baseDate = fixTimezone(t.data);
        if (!baseDate) return null;

        let start = new Date(baseDate);
        let end = new Date(baseDate);

        if (t.horario) {
          const [h, m] = t.horario.split(":");
          start.setHours(Number(h), Number(m), 0);
          end = new Date(start.getTime() + 60 * 60 * 1000); // +1h
        }

        return {
          id: t.id,
          title: t.titulo,
          start,
          end,
          allDay: !t.horario,
        };
      })
      .filter(Boolean) as any[];
  }, [tarefas]);

  // =======================
  // MARCAR TAREFA COMO CONCLUÍDA
  // =======================
  const toggleConcluido = async (t: Tarefa) => {
    await updateDoc(doc(db, "tarefas", t.id), {
      concluido: !t.concluido,
    });
  };

  // =======================
  // CLICK NO DIA → criar nova
  // =======================
  const criarTarefaNoDia = (slot: any) => {
    const dia = slot.start.toISOString().slice(0, 10);
    window.location.href = `/tarefas/novo?data=${dia}`;
  };

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

      {/* BUSCA */}
      <input
        type="text"
        placeholder="Buscar tarefa..."
        className="border p-2 rounded mb-4 w-full"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

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
          LISTA
      =========================== */}
      {aba === "lista" && (
        <div className="bg-white rounded-lg shadow border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3">Concluir</th>
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

                  <td className="p-3">{t.titulo}</td>

                  <td className="p-3">
                    {fixTimezone(t.data)?.toLocaleDateString("pt-BR")}
                  </td>

                  <td className="p-3">{t.horario || "-"}</td>

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
                  <td colSpan={5} className="text-center p-4 text-gray-500">
                    Nenhuma tarefa encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ==========================
          CALENDÁRIO
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
            style={{ height: 600 }}
            selectable
            onSelectSlot={criarTarefaNoDia}
            onSelectEvent={(e) =>
              (window.location.href = `/tarefas/${e.id}`)
            }
          />
        </div>
      )}
    </Layout>
  );
}
