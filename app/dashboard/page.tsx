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
  data?: any; // Firestore Timestamp
};

type Apolice = {
  id: string;
  numero?: string;
  refNome?: string;
  fimVigencia?: any; // Firestore Timestamp
};

export default function DashboardPage() {
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalApolices, setTotalApolices] = useState(0);
  const [tarefasProximas, setTarefasProximas] = useState<Tarefa[]>([]);
  const [renovacoes, setRenovacoes] = useState<Apolice[]>([]);

  useEffect(() => {
    // ===== LEADS =====
    const unsubLeads = onSnapshot(collection(db, "leads"), (snap) => {
      setTotalLeads(snap.size);
    });

    // ===== CLIENTES =====
    const unsubClientes = onSnapshot(collection(db, "clientes"), (snap) => {
      setTotalClientes(snap.size);
    });

    // ===== APÓLICES =====
    const unsubApolices = onSnapshot(
      collection(db, "todasApolices"),
      (snap) => {
        setTotalApolices(snap.size);
      }
    );

    // ===== PRÓXIMAS TAREFAS (5 mais próximas com data) =====
    const qTarefas = query(
      collection(db, "tarefas"),
      orderBy("data", "asc"),
      limit(5)
    );

    const unsubTarefas = onSnapshot(qTarefas, (snap) => {
      const lista = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setTarefasProximas(lista);
    });

    // ===== RENOVAÇÕES 30 DIAS =====
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
      const lista = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setRenovacoes(lista);
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
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* CARDS RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        {/* LEADS */}
        <div className="rounded-2xl p-6 shadow-md bg-gradient-to-br from-blue-600 to-blue-800 text-white">
          <p className="text-sm opacity-80">Total de Leads</p>
          <p className="text-4xl font-extrabold mt-1">{totalLeads}</p>
          <p className="text-xs mt-2 opacity-80">
            Leads ativos cadastrados no funil.
          </p>
        </div>

        {/* CLIENTES */}
        <div className="rounded-2xl p-6 shadow-md bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
          <p className="text-sm opacity-80">Total de Clientes</p>
          <p className="text-4xl font-extrabold mt-1">{totalClientes}</p>
          <p className="text-xs mt-2 opacity-80">
            Clientes com cadastro ativo no CRM.
          </p>
        </div>

        {/* APÓLICES */}
        <div className="rounded-2xl p-6 shadow-md bg-gradient-to-br from-purple-600 to-purple-800 text-white">
          <p className="text-sm opacity-80">Total de Apólices</p>
          <p className="text-4xl font-extrabold mt-1">{totalApolices}</p>
          <p className="text-xs mt-2 opacity-80">
            Apólices registradas em todas as companhias.
          </p>
        </div>
      </div>

      {/* PRÓXIMAS TAREFAS */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">Próximas tarefas</h2>
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-5">
          {tarefasProximas.length === 0 && (
            <p className="text-gray-500 text-sm">
              Nenhuma tarefa próxima cadastrada.
            </p>
          )}

          {tarefasProximas.map((t) => {
            const data = t.data?.toDate?.();
            const dataFmt = data
              ? data.toLocaleDateString("pt-BR")
              : "Sem data";

            const horaFmt = data
              ? data.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            return (
              <div
                key={t.id}
                className="flex items-center justify-between border-b last:border-b-0 py-2"
              >
                <div>
                  <p className="font-semibold text-sm">{t.titulo}</p>
                  <p className="text-xs text-gray-600">
                    {dataFmt}
                    {horaFmt && ` — ${horaFmt}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RENOVAÇÕES */}
      <section>
        <h2 className="text-xl font-bold mb-3">
          Renovações (próximos 30 dias)
        </h2>
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-5">
          {renovacoes.length === 0 && (
            <p className="text-gray-500 text-sm">
              Nenhuma apólice para renovar nos próximos 30 dias.
            </p>
          )}

          {renovacoes.map((a) => {
            const dt = a.fimVigencia?.toDate?.();
            const dtFmt = dt
              ? dt.toLocaleDateString("pt-BR")
              : "Data não informada";

            return (
              <div
                key={a.id}
                className="flex items-center justify-between border-b last:border-b-0 py-2"
              >
                <div>
                  <p className="font-semibold text-sm">
                    {a.numero || "Sem número"} — {a.refNome || "Sem nome"}
                  </p>
                  <p className="text-xs text-gray-600">
                    Vence em {dtFmt}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}
