"use client";

import Layout from "@/components/Layout";
import {
  collection,
  getCountFromServer,
  query,
  orderBy,
  where,
  getDocs,
  limit
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalApolices, setTotalApolices] = useState(0);
  const [tarefasProximas, setTarefasProximas] = useState<any[]>([]);
  const [renovacoes, setRenovacoes] = useState<any[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      // --- TOTAL DE LEADS ---
      const countLeads = await getCountFromServer(collection(db, "leads"));
      setTotalLeads(countLeads.data().count);

      // --- TOTAL DE CLIENTES ---
      const countClientes = await getCountFromServer(collection(db, "clientes"));
      setTotalClientes(countClientes.data().count);

      // --- TOTAL DE APÓLICES ---
      const countApolices = await getCountFromServer(collection(db, "todasApolices"));
      setTotalApolices(countApolices.data().count);

      // --- TAREFAS PRÓXIMAS ---
      const qTarefas = query(
        collection(db, "tarefas"),
        orderBy("data", "asc"),
        limit(5)
      );
      const snapT = await getDocs(qTarefas);
      setTarefasProximas(snapT.docs.map((d) => ({ id: d.id, ...d.data() })));

      // --- RENOVAÇÕES próximas 30 dias ---
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
      const snapR = await getDocs(qRen);
      setRenovacoes(snapR.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Erro carregando dashboard:", err);
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* ============================ */}
      {/*        CARDS DE RESUMO       */}
      {/* ============================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        {/* LEADS */}
        <div className="p-6 shadow-lg rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-sm opacity-80">Total de Leads</p>
          <p className="text-4xl font-bold">{totalLeads}</p>
        </div>

        {/* CLIENTES */}
        <div className="p-6 shadow-lg rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-white">
          <p className="text-sm opacity-80">Total de Clientes</p>
          <p className="text-4xl font-bold">{totalClientes}</p>
        </div>

        {/* APÓLICES */}
        <div className="p-6 shadow-lg rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <p className="text-sm opacity-80">Total de Apólices</p>
          <p className="text-4xl font-bold">{totalApolices}</p>
        </div>

      </div>

      {/* =========================== */}
      {/*     PRÓXIMAS TAREFAS        */}
      {/* =========================== */}
      <h2 className="text-xl font-bold mb-2">Próximas tarefas</h2>
      <div className="bg-white border rounded-xl p-4 mb-10 shadow-sm">
        {tarefasProximas.length === 0 && (
          <p className="text-gray-500">Nenhuma tarefa próxima.</p>
        )}

        {tarefasProximas.map((t) => (
          <div key={t.id} className="border-b py-3">
            <p className="font-semibold">{t.titulo}</p>
            <p className="text-xs text-gray-600">
              {t.data?.toDate?.().toLocaleDateString("pt-BR") || "Sem data"}
            </p>
          </div>
        ))}
      </div>

      {/* =========================== */}
      {/*     RENOVAÇÕES PRÓXIMAS    */}
      {/* =========================== */}
      <h2 className="text-xl font-bold mb-2">Renovações dos próximos 30 dias</h2>
      <div className="bg-white border rounded-xl p-4 shadow-sm">
        {renovacoes.length === 0 && (
          <p className="text-gray-500">Nenhuma renovação próxima.</p>
        )}

        {renovacoes.map((a) => (
          <div key={a.id} className="border-b py-3">
            <p className="font-semibold">{a.numero} — {a.refNome}</p>
            <p className="text-xs text-gray-600">
              Vence em {a.fimVigencia?.toDate?.().toLocaleDateString("pt-BR")}
            </p>
          </div>
        ))}
      </div>
    </Layout>
  );
}

