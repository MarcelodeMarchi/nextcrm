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
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// 📌 CALENDÁRIO
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
// TIPOS
// =======================
type Tarefa = {
  id: string;
  titulo: string;
  data?: any;
  horario?: string;
  concluido: boolean;
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
  // CARREGAR LISTA
  // =======================
  useEffect(() => {
    const q = query(collection(db, "tarefas"), orderBy("data", "asc"));

    const unsub = onSnapshot(q, (snap) => {
      setTarefas(
        snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Tarefa[]
      );
    });

    return unsub;
  }, []);

  const toggleConcluido = async (t: Tarefa) => {
    await updateDoc(doc(db, "tarefas", t.id), {
      concluido: !t.concluido,
    });
  };

  // =======================
  // CRIAR TAREFA AO CLICAR NO CALENDÁRIO
  // =======================
  const criarTarefaNoDia = async (slot: any) => {
    const data = new Date(slot.start);

    await addDoc(collection(db, "tarefas"), {
      titulo: "Nova tarefa",
      data,
      horario: "09:00",
      concluido: false,
      criadoEm: serverTimestamp(),
    });
  };

  // =======================
  // EVENTOS DO CALENDÁRIO
  // =======================
  const eventos = tarefas
    .filter((t) => t.data)
    .map((t) => {
      const dataBase = t.data?.toDate ? t.data.toDate() : new Date(t.data);

      let inicio = new Date(dataBase);
      let fim = new Date(dataBase);

      if (t.horario) {
        const [h, m] = t.horario.split(":");
        inicio.setHours(Number(h), Number(m));
        fim = new Date(inicio.getTime() + 60 * 60 * 1000);
      }

      return {
        id: t.id,
        title: t.titulo,
        start: inicio,
        end: fim,
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
            aba === "lista" ? "bg-black text-white" : "bg-gray-200"
          }`}
        >
          Lista
        </button>

        <button
          onClick={() => setAba("calendario")}
          className={`px-4 py-2 rounded ${
            aba === "calendario" ? "bg-black text-white" : "bg-gray-200"
          }`}
        >
          Calendário
        </button>
      </div>

      {/* FILTRO */}
      {aba === "lista" && (
        <input
          type="text"
          placeholder="Buscar tarefa..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="mb-4 w-full border p-3 rounded"
        />
      )}

      {/* ======================
          LISTA
      ======================= */}
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
              {tarefas
                .filter((t) =>
                  t.titulo.toLowerCase().includes(busca.toLowerCase())
                )
                .map((t) => (
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
                      {t.data?.toDate?.().toLocaleDateString("pt-BR") || "-"}
                    </td>

                    <td className="p-3">{t.horario || "-"}</td>

                    <td className="p-3">
                      <Link
                        href={`/tarefas/${t.id}`}
                        className="text-blue-600"
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

      {/* ======================
          CALENDÁRIO
      ======================= */}
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
