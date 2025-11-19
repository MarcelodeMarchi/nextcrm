"use client";

import Layout from "@/components/Layout";
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
  where,
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
    // LEADS (contagem real)
    const leadsSnap = await getDocs(collection(db, "leads"));
    setTotalLeads(leadsSnap.size);

    // CLIENTES (contagem real)
    const clientesSnap = await getDocs(collection(db, "clientes"));
    setTotalClientes(clientesSnap.size);

    // APÓLICES (contagem real)
    const apSnap = await getDocs(collection(db, "todasApolices"));
    setTotalApolices(apSnap.size);

    // TAREFAS PRÓXIMAS
    const qTarefas = query(
      collection(db, "tarefas"),
      orderBy("data", "asc"),
      limit(5)
    );
    setTarefasProximas(
      (await getDocs(qTarefas)).docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }))
    );

    // RENOVAÇÕES – 30 dias
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

    setRenovacoes(
      (await getDocs(qRen)).docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }))
    );
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <div className="bg-blue-600 text-white shadow-lg rounded-xl p-6">
          <p className="text-sm opacity-90">Total de Leads</p>
          <p className="text-4xl font-bold mt-2">{totalLeads}</p>
        </div>

        <div className="bg-green-600 text-white shadow-lg rounded-xl p-6">
          <p className="text-sm opacity-90">Total de Clientes</p>
          <p className="text-4xl font-bold mt-2">{totalClientes}</p>
        </div>

        <div className="bg-purple-600 text-white shadow-lg rounded-xl p-6">
          <p className="text-sm opacity-90">Total de Apólices</p>
          <p className="text-4xl font-bold mt-2">{totalApolices}</p>
        </div>

      </div>

      {/* TAREFAS */}
      <h2 className="text-xl font-bold mb-3">Próximas tarefas</h2>
      <div className="bg-white rounded-xl shadow p-5 mb-10">
        {tarefasProximas.length === 0 && (
          <p className="text-gray-500">Nenhuma tarefa próxima.</p>
        )}

        {tarefasProximas.map((t) => (
          <div key={t.id} className="border-b py-2">
            <p className="font-medium">{t.titulo}</p>
            <p className="text-xs text-gray-500">
              {t.data?.toDate?.().toLocaleDateString() || "Sem data"}
            </p>
          </div>
        ))}
      </div>

      {/* RENOVAÇÕES */}
      <h2 className="text-xl font-bold mb-3">Renovações (30 dias)</h2>
      <div className="bg-white rounded-xl shadow p-5">
        {renovacoes.length === 0 && (
          <p className="text-gray-500">Nenhuma renovação próxima.</p>
        )}

        {renovacoes.map((a) => (
          <div key={a.id} className="border-b py-2">
            <p className="font-medium">
              {a.numero} — {a.refNome}
            </p>
            <p className="text-xs text-gray-500">
              Vence em {a.fimVigencia?.toDate?.().toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </Layout>
  );
}
