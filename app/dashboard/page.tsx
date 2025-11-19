"use client";

import Layout from "@/components/Layout";
import {
  collection,
  query,
  getDocs,
  where,
  orderBy,
  limit,
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
    carregar();
  }, []);

  const carregar = async () => {
    // LEADS reais
    const leadsSnap = await getDocs(collection(db, "leads"));
    setTotalLeads(leadsSnap.size);

    // CLIENTES reais
    const clientesSnap = await getDocs(collection(db, "clientes"));
    setTotalClientes(clientesSnap.size);

    // APÓLICES reais
    const apolicesSnap = await getDocs(collection(db, "todasApolices"));
    setTotalApolices(apolicesSnap.size);

    // Próximas tarefas
    const tarefasQ = query(
      collection(db, "tarefas"),
      orderBy("data", "asc"),
      limit(5)
    );
    const tarefas = await getDocs(tarefasQ);
    setTarefasProximas(
      tarefas.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }))
    );

    // Renovação 30 dias
    const hoje = new Date();
    const limite = new Date();
    limite.setDate(limite.getDate() + 30);

    const renovQ = query(
      collection(db, "todasApolices"),
      where("fimVigencia", ">=", hoje),
      where("fimVigencia", "<=", limite),
      orderBy("fimVigencia", "asc"),
      limit(5)
    );
    const renov = await getDocs(renovQ);
    setRenovacoes(
      renov.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }))
    );
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <div className="p-6 rounded-lg shadow bg-blue-50 border border-blue-200">
          <p className="text-blue-700 text-sm">Total de Leads</p>
          <p className="text-4xl font-bold text-blue-900">{totalLeads}</p>
        </div>

        <div className="p-6 rounded-lg shadow bg-green-50 border border-green-200">
          <p className="text-green-700 text-sm">Total de Clientes</p>
          <p className="text-4xl font-bold text-green-900">{totalClientes}</p>
        </div>

        <div className="p-6 rounded-lg shadow bg-purple-50 border border-purple-200">
          <p className="text-purple-700 text-sm">Total de Apólices</p>
          <p className="text-4xl font-bold text-purple-900">{totalApolices}</p>
        </div>

      </div>

      {/* Tarefas próximas */}
      <h2 className="text-xl font-bold mb-2">Próximas tarefas</h2>
      <div className="bg-white border rounded-lg p-4 mb-10">
        {tarefasProximas.length === 0 && (
          <p className="text-gray-500">Nenhuma tarefa próxima.</p>
        )}

        {tarefasProximas.map((t) => (
          <div key={t.id} className="border-b py-2">
            <p className="text-sm font-semibold">{t.titulo}</p>
            <p className="text-xs text-gray-500">
              {t.data?.toDate?.().toLocaleDateString() || "Sem data"}
            </p>
          </div>
        ))}
      </div>

      {/* Renovação */}
      <h2 className="text-xl font-bold mb-2">Renovações (30 dias)</h2>
      <div className="bg-white border rounded-lg p-4">
        {renovacoes.length === 0 && (
          <p className="text-gray-500">Nenhuma renovação próxima.</p>
        )}

        {renovacoes.map((a) => (
          <div key={a.id} className="border-b py-2">
            <p className="text-sm font-semibold">
              {a.numero} — {a.refNome}
            </p>
            <p className="text-xs text-gray-500">
              {a.fimVigencia?.toDate?.().toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </Layout>
  );
}
