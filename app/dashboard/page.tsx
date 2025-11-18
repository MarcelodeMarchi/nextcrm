"use client";

import Layout from "@/components/Layout";
import { collection, getCountFromServer, query, where, orderBy, getDocs, limit } from "firebase/firestore";
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
    // Leads
    const cLeads = await getCountFromServer(collection(db, "leads"));
    setTotalLeads(cLeads.data().count);

    // Clientes
    const cClientes = await getCountFromServer(collection(db, "clientes"));
    setTotalClientes(cClientes.data().count);

    // Apólices
    const cApolices = await getCountFromServer(collection(db, "todasApolices"));
    setTotalApolices(cApolices.data().count);

    // Tarefas – próximas 5
    const qTarefas = query(
      collection(db, "tarefas"),
      orderBy("data", "asc"),
      limit(5)
    );
    setTarefasProximas((await getDocs(qTarefas)).docs.map((d) => ({ id: d.id, ...d.data() })));

    // Renovação de apólices (30 dias)
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

    setRenovacoes((await getDocs(qRen)).docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500 text-sm">Total de Leads</p>
          <p className="text-3xl font-bold">{totalLeads}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500 text-sm">Total de Clientes</p>
          <p className="text-3xl font-bold">{totalClientes}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500 text-sm">Total de Apólices</p>
          <p className="text-3xl font-bold">{totalApolices}</p>
        </div>

      </div>

      {/* TAREFAS PRÓXIMAS */}
      <h2 className="text-xl font-bold mb-2">Próximas tarefas</h2>
      <div className="bg-white border rounded-lg p-4 mb-10">
        {tarefasProximas.length === 0 && <p className="text-gray-500">Nenhuma tarefa próxima.</p>}
        {tarefasProximas.map((t) => (
          <div key={t.id} className="border-b py-2">
            <p className="text-sm font-semibold">{t.titulo}</p>
            <p className="text-xs text-gray-500">
              {t.data?.toDate?.().toLocaleDateString() || "Sem data"}
            </p>
          </div>
        ))}
      </div>

      {/* RENOVAÇÕES EM BREVE */}
      <h2 className="text-xl font-bold mb-2">Renovações (próximos 30 dias)</h2>
      <div className="bg-white border rounded-lg p-4">
        {renovacoes.length === 0 && <p className="text-gray-500">Nenhuma renovação próxima.</p>}
        {renovacoes.map((a) => (
          <div key={a.id} className="border-b py-2">
            <p className="text-sm font-semibold">{a.numero} — {a.refNome}</p>
            <p className="text-xs text-gray-500">
              Vence em {a.fimVigencia?.toDate?.().toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </Layout>
  );
}
