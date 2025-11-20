"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Layout from "@/components/Layout";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

// Converte data YYYY-MM-DD para objeto Date com timezone correto
const fixDate = (dateStr: string, timeStr?: string) => {
  if (!dateStr) return null;

  const hora = timeStr || "12:00";
  const dt = new Date(`${dateStr}T${hora}:00`);
  return new Date(dt.toISOString().replace("Z", ""));
};

export default function NovaTarefaPage() {
  const router = useRouter();
  const params = useSearchParams();

  // Se veio do clique no calendário, já preenche a data
  const dataInicial = params.get("data") || "";

  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState(dataInicial);
  const [horario, setHorario] = useState("");
  const [concluido] = useState(false);

  const salvar = async () => {
    const dataFinal = fixDate(data, horario);

    await addDoc(collection(db, "tarefas"), {
      titulo,
      data: dataFinal,
      horario: horario || null,
      concluido,
      criadoEm: serverTimestamp(),
    });

    alert("Tarefa criada!");
    router.push("/tarefas");
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Nova Tarefa</h1>

      <div className="space-y-4 max-w-lg">

        {/* TÍTULO */}
        <div>
          <label className="block text-sm mb-1">Título</label>
          <input
            className="border rounded-md px-3 py-2 w-full"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>

        {/* DATA */}
        <div>
          <label className="block text-sm mb-1">Data</label>
          <input
            type="date"
            className="border rounded-md px-3 py-2 w-full"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </div>

        {/* HORÁRIO */}
        <div>
          <label className="block text-sm mb-1">Horário</label>
          <input
            type="time"
            className="border rounded-md px-3 py-2 w-full"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
          />
        </div>

        <button
          onClick={salvar}
          className="px-4 py-2 bg-black text-white rounded-md"
        >
          Salvar
        </button>

        <button
          onClick={() => router.push("/tarefas")}
          className="px-4 py-2 bg-gray-300 rounded-md ml-3"
        >
          Cancelar
        </button>
      </div>
    </Layout>
  );
}
