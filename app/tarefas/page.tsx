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

import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import "react-big-calendar/lib/css/react-big-calendar.css";

// LOCALIZAÇÃO
const locales = { "pt-BR": ptBR };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// TIPOS
type Tarefa = {
  id: string;
  titulo: string;
  data?: any;
  horario?: string;
  concluido: boolean;
};

export default function TarefasPage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [aba, setAba] = useState<"lista" | "calendario">("lista");
  const [busca, setBusca] = useState("");

  // DETECTAR MOBILE
  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768;

  // BUSCAR TAREFAS
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

  const criarTarefaSimples = async () => {
    await addDoc(collection(db, "tarefas"), {
      titulo: "Nova Tarefa",
      data: new Date(),
      horario: "09:00",
      concluido: false,
      criadoEm: serverTimestamp(),
    });
  };

  // EVENTOS DO CALENDÁRIO DESKTOP
  const eventos = tarefas
    .filter((t) => t.data)
    .map((t) => {
      const base = t.data?.toDate ? t.data.toDate() : new Date(t.data);

      let start = new Date(base);
      let end = new Date(base);

      if (t.horario) {
        const [h, m] = t.horario.split(":");
        start.setHours(Number(h), Number(m));
        end = new Date(start.getTime() + 60 * 60 * 1000);
      }

      return {
        id: t.id,
        title: t.titulo,
        start,
        end,
      };
    });

  // ============================
  // 📱 MOBILE — AGENDA DIÁRIA
  // ============================

  const organizarAgendaMobile = () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    amanha.setHours(0, 0, 0, 0);

    const itensHoje = tarefas.filter((t) => {
      const d = t.data?.toDate?.();
      if (!d) return false;
      d.setHours(0, 0, 0, 0);
      return d.getTime() === hoje.getTime();
    });

    const itensAmanha = tarefas.filter((t) => {
      const d = t.data?.toDate?.();
      if (!d) return false;
      d.setHours(0, 0, 0, 0);
      return d.getTime() === amanha.getTime();
    });

    const proximos = tarefas.filter((t) => {
      const d = t.data?.toDate?.();
      if (!d) return false;
      d.setHours(0, 0, 0, 0);
      return d > amanha;
    });

    return { itensHoje, itensAmanha, proximos };
  };

  const { itensHoje, itensAmanha, proximos } = organizarAgendaMobile();

  // ============================
  // 📱 MOBILE VIEW
  // ============================

  if (isMobile) {
    return (
      <Layout>
        <h1 className="text-2xl font-bold mb-4">Tarefas</h1>

        <div className="flex gap-2 mb-4">
          <button
            onClick={criarTarefaSimples}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md text-sm"
          >
            + Nova
          </button>

          <Link
            href="/tarefas/novo"
            className="flex-1 px-4 py-2 bg-black text-white rounded-md text-sm"
          >
            Completa
          </Link>
        </div>

        {/* HOJE */}
        <h2 className="text-lg font-bold mt-4 mb-2">Hoje</h2>
        {itensHoje.length === 0 && (
          <p className="text-gray-500 text-sm mb-3">Nenhuma tarefa.</p>
        )}
        {itensHoje.map((t) => (
          <div
            key={t.id}
            className="bg-white shadow rounded-lg p-4 mb-3 border"
            onClick={() => (window.location.href = `/tarefas/${t.id}`)}
          >
            <p className="font-semibold">{t.titulo}</p>
            <p className="text-xs text-gray-600 mt-1">
              {t.horario || "Sem horário"}
            </p>
          </div>
        ))}

        {/* AMANHÃ */}
        <h2 className="text-lg font-bold mt-4 mb-2">Amanhã</h2>
        {itensAmanha.length === 0 && (
          <p className="text-gray-500 text-sm mb-3">Nada agendado.</p>
        )}
        {itensAmanha.map((t) => (
          <div
            key={t.id}
            className="bg-white shadow rounded-lg p-4 mb-3 border"
            onClick={() => (window.location.href = `/tarefas/${t.id}`)}
          >
            <p className="font-semibold">{t.titulo}</p>
            <p className="text-xs text-gray-600 mt-1">
              {t.horario || "Sem horário"}
            </p>
          </div>
        ))}

        {/* PRÓXIMOS DIAS */}
        <h2 className="text-lg font-bold mt-4 mb-2">Próximos dias</h2>
        {proximos.length === 0 && (
          <p className="text-gray-500 text-sm mb-3">Nenhuma tarefa futura.</p>
        )}
        {proximos.map((t) => {
          const d = t.data?.toDate?.();
          const dataFmt = d
            ? d.toLocaleDateString("pt-BR")
            : "Sem data";

          return (
            <div
              key={t.id}
              className="bg-white shadow rounded-lg p-4 mb-3 border"
              onClick={() => (window.location.href = `/tarefas/${t.id}`)}
            >
              <p className="font-semibold">{t.titulo}</p>
              <p className="text-xs text-gray-600 mt-1">
                {dataFmt} — {t.horario || "Sem horário"}
              </p>
            </div>
          );
        })}
      </Layout>
    );
  }

  // ============================
  // 💻 DESKTOP (NÃO ALTERADO)
  // ============================

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tarefas</h1>

        <div className="flex gap-2">
          <button
            onClick={criarTarefaSimples}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm"
          >
            + Criar Tarefa Rápida
          </button>

          <Link
            href="/tarefas/novo"
            className="px-4 py-2 bg-black text-white rounded-md text-sm"
          >
            Nova Tarefa Completa
          </Link>
        </div>
      </div>

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
            aba === "calendario"
              ? "bg-black text-white"
              : "bg-gray-200"
          }`}
        >
          Calendário
        </button>
      </div>

      {/* LISTA DESKTOP */}
      {aba === "lista" && (
        <div className="bg-white rounded-lg shadow border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3">✓</th>
                <th className="p-3">Título</th>
                <th className="p-3">Data</th>
                <th className="p-3">Hora</th>
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
                    {t.data?.toDate?.().toLocaleDateString("pt-BR") ||
                      "-"}
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

      {/* CALENDÁRIO DESKTOP */}
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
            onSelectEvent={(e) =>
              (window.location.href = `/tarefas/${e.id}`)
            }
          />
        </div>
      )}
    </Layout>
  );
}
