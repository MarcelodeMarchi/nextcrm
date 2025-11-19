"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";

export default function EditarTarefaPage() {
  const { id } = useParams();
  const router = useRouter();

  const [tarefa, setTarefa] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      const ref = doc(db, "tarefas", id as string);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        router.replace("/tarefas");
        return;
      }

      const data = snap.data();

      setTarefa({
        id,
        ...data,
        data:
          data.data?.toDate
            ? data.data.toDate() // Firestore Timestamp
            : data.data ?? null,  // Date ou null
      });

      setLoading(false);
    };

    carregar();
  }, [id, router]);

  const salvar = async () => {
    await updateDoc(doc(db, "tarefas", id as string), {
      titulo: tarefa.titulo,
      concluido: tarefa.concluido,
      data: tarefa.data ? Timestamp.fromDate(tarefa.data) : null, // 🔥 CORRETO
    });

    alert("Tarefa atualizada!");
    router.push("/tarefas");
  };

  if (loading) {
    return (
      <Layout>
        <p>Carregando...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Editar Tarefa</h1>

      <div className="space-y-4 max-w-lg">
        {/* TÍTULO */}
        <div>
          <label className="block text-sm">Título</label>
          <input
            className="border rounded-md px-3 py-2 w-full"
            value={tarefa.titulo}
            onChange={(e) =>
              setTarefa({ ...tarefa, titulo: e.target.value })
            }
          />
        </div>

        {/* DATA */}
        <div>
          <label className="block text-sm">Data</label>
          <input
            type="date"
            className="border rounded-md px-3 py-2 w-full"
            value={
              tarefa.data
                ? tarefa.data.toISOString().substring(0, 10)
                : ""
            }
            onChange={(e) =>
              setTarefa({
                ...tarefa,
                data: e.target.value ? new Date(e.target.value) : null,
              })
            }
          />
        </div>

        {/* CONCLUÍDA */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={tarefa.concluido}
            onChange={() =>
              setTarefa({ ...tarefa, concluido: !tarefa.concluido })
            }
          />
          <label className="text-sm">Concluída</label>
        </div>

        {/* SALVAR */}
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
