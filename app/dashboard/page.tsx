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
    // ===== LEADS =====
    const leadsSnap = await getDocs(collection(db, "leads"));
    setTotalLeads(leadsSnap.docs.length);

    // ===== CLIENTES =====
    const clientesSnap = await getDocs(collection(db, "clientes"));
    setTotalClientes(clientesSnap.docs.length);

    // ===== APÓLICES =====
    const apSnap = await getDocs(collection(db, "todasApolices"));
    setTotalApolices(apSnap.docs.length);

    // ===== PRÓXIMAS TAREFAS =====
    const qTarefas = query(
      collection(db, "tarefas"),
      orderBy("data", "asc"),
      limit(5)
    );

    const tarefas = (await getDocs(qTarefas)).docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    setTarefasProximas(tarefas);

    // ===== RENOVAÇÕES (30 DIAS) =====
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

    const renov = (await getDocs(qRen)).docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    setRenovacoes(renov);
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <div className="bg-blue-600 text-white rounded-lg shadow p-6">
          <p className="text-sm opacity-80">Total de Leads</p>
          <p className="text-4xl font-bold">{totalLeads}</p>
        </div>

        <div className="bg-green-600 text-white rounded-lg shadow p-6">
          <p className="text-sm opacity-80">Total de Clientes</p>
          <p className="text-4xl font-bold">{totalClientes}</p>
        </div>

        <div className="bg-purple-600 text-white rounded-lg shadow p-6">
          <p className="text-sm opacity-80">Total de Apólices</p>
          <p className="text-4xl font-bold">{totalApolices}</p>
        </div>

      </div>

      {/* PRÓXIMAS TAREFAS */}
      <h2 className="text-xl font-bold mb-2">Próximas tarefas</h2>

      <div className="bg-white rounded-lg shadow p-5 mb-10">
        {tarefasProximas.length === 0 && (
          <p className="text-gray-500">Nenhuma tarefa próxima.</p>
        )}

        {tarefasProximas.map((t) => {
          const data = t.data?.toDate?.();
          const dataFmt = data
            ? data.toLocaleDateString("pt-BR")
            : "Sem data";

          const horaFmt = data
            ? data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
            : "";

          return (
            <div key={t.id} className="border-b py-2">
              <p className="font-semibold">{t.titulo}</p>
              <p className="text-xs text-gray-600">
                {dataFmt} {horaFmt && `— ${horaFmt}`}
              </p>
            </div>
          );
        })}
      </div>

      {/* RENOVAÇÕES */}
      <h2 className="text-xl font-bold mb-2">Renovações (30 dias)</h2>

      <div className="bg-white rounded-lg shadow p-5">
        {renovacoes.length === 0 && (
          <p className="text-gray-500">Nenhuma renovação próxima.</p>
        )}

        {renovacoes.map((a) => (
          <div key={a.id} className="border-b py-2">
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
