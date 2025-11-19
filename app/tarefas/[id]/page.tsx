"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

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

      const dados = snap.data();

      let hora = "09:00";
      if (dados.data) {
        const dt = dados.data.toDate();
        hora = dt.toISOString().substring(11, 16);
      }

      setTarefa({
        ...dados,
        id,
        hora,
      });

      setLoading(false);
    };

    carregar();
  }, [id, router]);

  const salvar = async () => {
    let dataFinal = null;
    if (tarefa.data && tarefa.hora) {
      const [h, m] = tarefa.hora.split(":").map(Number);
      const dt = new Date(tarefa.data);
      dt.setHours(h, m, 0, 0);
      dataFinal = dt;
    }

    await updateDoc(doc(db, "tarefas", id as string), {
      titulo: tarefa.titulo,
      concluido: tarefa.concluido,
      data: dataFinal,
    });

    alert("Tarefa atualizada!");
  };

  const excluir = async () => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;

    await deleteDoc(doc(db, "tarefas", id as string));
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

        {/* Título */}
        <div>
          <label className="block text-sm">Título</label>
          <input
            className="border rounded-md px-3 py-2 w-full"
            value={tarefa.titulo}
            onChange={(e) => setTarefa({ ...tarefa, titulo: e.target.value })}
          />
        </div>

        {/* Data */}
        <div>
          <label className="block text-sm">Data</label>
          <input
            type="date"
            className="border rounded-md px-3 py-2 w-full"
            value={
              tarefa.data
                ? new Date(tarefa.data).toISOString().substring(0, 10)
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

        {/* Horário */}
        <div>
          <label className="block text-sm">Horário</label>
          <input
            type="time"
            className="border rounded-md px-3 py-2 w-full"
            value={tarefa.hora}
            onChange={(e) =>
              setTarefa({
                ...tarefa,
                hora: e.target.value,
              })
            }
          />
        </div>

        {/* Concluído */}
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

        {/* Salvar */}
        <button
          onClick={salvar}
          className="px-4 py-2 bg-black text-white rounded-md"
        >
          Salvar
        </button>

        {/* Excluir */}
        <button
          onClick={excluir}
          className="px-4 py-2 bg-red-600 text-white rounded-md"
        >
          Excluir Tarefa
        </button>
      </div>
    </Layout>
  );
}
