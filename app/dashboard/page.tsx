"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";

type Tarefa = {
  id: string;
  titulo: string;
  data?: any;
};

type Apolice = {
  id: string;
  numero?: string;
  refNome?: string;
  fimVigencia?: any;
};

export default function DashboardPage() {
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalApolices, setTotalApolices] = useState(0);
  const [tarefasProximas, setTarefasProximas] = useState<Tarefa[]>([]);
  const [renovacoes, setRenovacoes] = useState<Apolice[]>([]);

  useEffect(() => {
    const unsubLeads = onSnapshot(collection(db, "leads"), (snap) =>
      setTotalLeads(snap.size)
    );

    const unsubClientes = onSnapshot(collection(db, "clientes"), (snap) =>
      setTotalClientes(snap.size)
    );

    const unsubApolices = onSnapshot(collection(db, "todasApolices"), (snap) =>
      setTotalApolices(snap.size)
    );

    const qTarefas = query(
      collection(db, "tarefas"),
      orderBy("data", "asc"),
      limit(5)
    );

    const unsubTarefas = onSnapshot(qTarefas, (snap) => {
      setTarefasProximas(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
      );
    });

    const hoje = new Date();
    const limite = new Date();
    limite.setDate(limite.getDate() + 30);

    const qRen = query(
      collection(db, "todasApolices"),
      where("fimVigencia", ">=", hoje),
      where("fimVigencia", "<=", limite),
      orderBy("fimVigencia", "asc"),
      limit(5)
    );

    const unsubRen = onSnapshot(qRen, (snap) => {
      setRenovacoes(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
      );
    });

    return () => {
      unsubLeads();
      unsubClientes();
      unsubApolices();
      unsubTarefas();
      unsubRen();
    };
  }, []);

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6 text-center md:text-left">
        Dashboard
      </h1>

      {/* === CARDS RESUMO === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10">

        <div className="rounded-2xl p-6 shadow-md bg-gradient-to-br from-blue-600 to-blue-800 text-white">
          <p className="text-sm opacity-80">Total de Leads</p>
          <p className="text-4xl font-extrabold mt-1">{totalLeads}</p>
          <p className="text-xs mt-2 opacity-80">Leads ativos cadastrados.</p>
        </div>

        <div className="rounded-2xl p-6 shadow-md bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
          <p className="text-sm opacity-80">Total de Clientes</p>
          <p className="text-4xl font-extrabold mt-1">{totalClientes}</p>
          <p className="text-xs mt-2 opacity-80">Clientes ativos cadastrados.</p>
        </div>

        <div className="rounded-2xl p-6 shadow-md bg-gradient-to-br from-purple-600 to-purple-800 text-white">
          <p className="text-sm opacity-80">Total de Apólices</p>
          <p className="text-4xl font-extrabold mt-1">{totalApolices}</p>
          <p className="text-xs mt-2 opacity-80">Apólices registradas.</p>
        </div>
      </div>

      {/* === PRÓXIMAS TAREFAS === */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">Próximas tarefas</h2>

        <div className="bg-white rounded-2xl shadow border p-5">

          {tarefasProximas.length === 0 && (
            <p className="text-gray-500 text-sm">Nenhuma tarefa futura.</p>
          )}

          {tarefasProximas.map((t) => {
            const dt = t.data?.toDate?.();
            const dataFmt = dt
              ? dt.toLocaleDateString("pt-BR")
              : "Sem data";
            const horaFmt = dt
              ? dt.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            return (
              <div
                key={t.id}
                className="py-3 border-b last:border-b-0 flex flex-col sm:flex-row sm:justify-between"
              >
                <p className="font-semibold text-sm">{t.titulo}</p>
                <p className="text-xs text-gray-600 mt-1 sm:mt-0">
                  {dataFmt} {horaFmt && `— ${horaFmt}`}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* === RENOVAÇÕES === */}
      <section>
        <h2 className="text-xl font-bold mb-3">
          Renovações (próximos 30 dias)
        </h2>

        <div className="bg-white rounded-2xl shadow border p-5">
          {renovacoes.length === 0 && (
            <p className="text-gray-500 text-sm">
              Nenhuma apólice para renovar.
            </p>
          )}

          {renovacoes.map((a) => {
            const dt = a.fimVigencia?.toDate?.();
            const dtFmt = dt
              ? dt.toLocaleDateString("pt-BR")
              : "Sem data";

            return (
              <div
                key={a.id}
                className="py-3 border-b last:border-b-0 flex flex-col sm:flex-row sm:justify-between"
              >
                <p className="font-semibold text-sm">
                  {a.numero || "---"} — {a.refNome || "---"}
                </p>

                <p className="text-xs text-gray-600 mt-1 sm:mt-0">
                  Vence em {dtFmt}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}
