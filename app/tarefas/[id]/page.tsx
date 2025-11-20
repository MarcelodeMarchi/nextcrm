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

  // 🔥 Função segura para converter qualquer data
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

      setTarefa({ id, ...snap.data() });
      setLoading(false);
    };

    carregar();
  }, [id, router]);

  const salvar = async () => {
    const dataFinal = tarefa.data
      ? new Date(`${toInputDate(tarefa.data)}T${tarefa.horario || "12:00"}:00`)
      : null;

    await updateDoc(doc(db, "tarefas", id as string), {
      titulo: tarefa.titulo,
      concluido: tarefa.concluido,
      data: dataFinal,
      horario: tarefa.horario || null,
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

  // 🔥 Ação WhatsApp
  const abrirWhatsApp = () => {
    if (!tarefa.relacionadoA || !tarefa.relacionadoA.telefone) {
      alert("Este registro não possui telefone associado.");
      return;
    }

    const numero = tarefa.relacionadoA.telefone.replace(/\D/g, "");
    if (!numero) return alert("Número inválido.");

    window.open(`https://wa.me/1${numero}`, "_blank");
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

        {/* RELACIONADO A */}
        {tarefa.relacionadoA && (
          <div className="p-3 border rounded bg-gray-50">
            <p className="text-sm">
              <strong>Relacionado:</strong> {tarefa.relacionadoA.nome}
            </p>
            <p className="text-sm text-gray-600">
              Telefone: {tarefa.relacionadoA.telefone || "Não informado"}
            </p>
          </div>
        )}

        {/* BOTÕES */}
        <div className="flex gap-3 mt-4">

          <button
            onClick={salvar}
            className="px-4 py-2 bg-green-600 text-white rounded-md"
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

          {/* 🔥 WHATSAPP */}
          {tarefa.relacionadoA?.telefone && (
            <button
              onClick={abrirWhatsApp}
              className="px-4 py-2 bg-green-600 text-white rounded-md ml-auto"
            >
              WhatsApp
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}
