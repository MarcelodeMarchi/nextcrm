"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function DashboardPage() {
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalApolices, setTotalApolices] = useState(0);

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, "leads"), (snap) =>
      setTotalLeads(snap.size)
    );

    const unsub2 = onSnapshot(collection(db, "clientes"), (snap) =>
      setTotalClientes(snap.size)
    );

    const unsub3 = onSnapshot(collection(db, "todasApolices"), (snap) =>
      setTotalApolices(snap.size)
    );

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Leads */}
        <div className="p-6 rounded-xl shadow bg-blue-100 border border-blue-300">
          <p className="text-sm text-blue-700 font-semibold">Total de Leads</p>
          <p className="text-4xl font-bold text-blue-900">{totalLeads}</p>
        </div>

        {/* Total Clientes */}
        <div className="p-6 rounded-xl shadow bg-green-100 border border-green-300">
          <p className="text-sm text-green-700 font-semibold">Total de Clientes</p>
          <p className="text-4xl font-bold text-green-900">{totalClientes}</p>
        </div>

        {/* Total Apólices */}
        <div className="p-6 rounded-xl shadow bg-purple-100 border border-purple-300">
          <p className="text-sm text-purple-700 font-semibold">
            Total de Apólices
          </p>
          <p className="text-4xl font-bold text-purple-900">{totalApolices}</p>
        </div>
      </div>
    </Layout>
  );
}
