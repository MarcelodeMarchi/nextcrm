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

  // Converte Firestore → input date
  const toInputDate = (value: any) => {
    if (!value) return "";
    try {
      if (value?.toDate) {
        return value.toDate().toISOString().slice(0, 10);
      }
      return new Date(value).toISOString().slice(0, 10);
    } catch {
      return "";
    }
  };

  useEffect(() => {
    const carregar = async () => {
      const ref = doc(db, "tarefas", id as string);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        router.replace("/tarefas");
        return;
      }

      const dados = snap.data();

      // Garantir que horário exista
      if (!dados.horario) dados.horario = "";

      setTarefa({ id, ...dados });
      setLoading(false);
    };

    carregar();
  }, [id, router]);

  const salvar = async () => {
    // Combinar data + horario EM UMA DATA REAL
    const dataFinal =
      tarefa.data && tarefa.horario
        ? new Date(`${toInputDate(tarefa.data)}T${tarefa.horario}:00`)
        : tarefa.data
        ? new Date(toInputDate(tarefa.data))
        : null;

    await updateDoc(doc(db, "tarefas", id as string), {
      titulo: tarefa.titulo,
      concluido: tarefa.concluido,
      data: dataFinal,
      horario: tarefa.horario || "",
    });

    alert("Tarefa atualizada!");
    router.push("/tarefas");
  };

  const excluir = async () => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;

    await deleteDoc(doc(db, "tarefas", id as string));
    alert("Tarefa excluída!");
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
            value={toInputDate(tarefa.data)}
            onChange={(e) =>
              setTarefa({
                ...tarefa,
                data: e.target.value ? new Date(e.target.value) : null,
              })
            }
          />
        </div>

        {/* HORÁRIO */}
        <div>
          <label className="block text-sm">Horário</label>
          <input
            type="time"
            className="border rounded-md px-3 py-2 w-full"
            value={tarefa.horario || ""}
            onChange={(e) =>
              setTarefa({ ...tarefa, horario: e.target.value })
            }
          />
        </div>

        {/* CHECKBOX */}
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

        {/* BOTÕES */}
        <div className="flex gap-3">
          <button
            onClick={salvar}
            className="px-4 py-2 bg-black text-white rounded-md"
          >
            Salvar
          </button>

          <button
            onClick={excluir}
            className="px-4 py-2 bg-red-600 text-white rounded-md"
          >
            Excluir
          </button>

          <button
            onClick={() => router.push("/tarefas")}
            className="px-4 py-2 bg-gray-300 rounded-md"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Layout>
  );
}
