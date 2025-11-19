"use client";

import Layout from "@/components/Layout";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function NovaTarefaPage() {
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("09:00");

  const salvar = async () => {
    let dataFinal = null;

    if (data && hora) {
      const [h, m] = hora.split(":").map(Number);
      const dt = new Date(data);
      dt.setHours(h, m, 0, 0);
      dataFinal = dt;
    }

    await addDoc(collection(db, "tarefas"), {
      titulo,
      concluido: false,
      data: dataFinal,
      criadoEm: serverTimestamp(),
    });

    router.push("/tarefas");
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Nova Tarefa</h1>

      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm">Título</label>
          <input
            className="border rounded-md px-3 py-2 w-full"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm">Data</label>
          <input
            type="date"
            className="border rounded-md px-3 py-2 w-full"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm">Horário</label>
          <input
            type="time"
            className="border rounded-md px-3 py-2 w-full"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
          />
        </div>

        <button
          onClick={salvar}
          className="px-4 py-2 bg-black text-white rounded-md"
        >
          Salvar
        </button>
      </div>
    </Layout>
  );
}
