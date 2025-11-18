"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function NovaTarefaPage() {
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState("");
  const [tipoRef, setTipoRef] = useState("");
  const [idRef, setIdRef] = useState("");
  const [listaRef, setListaRef] = useState<any[]>([]);

  useEffect(() => {
    if (tipoRef === "lead") {
      getDocs(collection(db, "leads")).then((snap) => {
        setListaRef(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      });
    } else if (tipoRef === "cliente") {
      getDocs(collection(db, "clientes")).then((snap) => {
        setListaRef(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      });
    }
  }, [tipoRef]);

  const salvar = async () => {
    await addDoc(collection(db, "tarefas"), {
      titulo,
      concluido: false,
      data: data ? new Date(data) : null,
      relacionadoA:
        tipoRef && idRef
          ? {
              tipo: tipoRef,
              id: idRef,
              nome: listaRef.find((x) => x.id === idRef)?.nome || "",
            }
          : null,
      criadoEm: serverTimestamp(),
    });

    router.push("/tarefas");
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Nova Tarefa</h1>

      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium">Título</label>
          <input
            className="border rounded-md px-3 py-2 w-full"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Data</label>
          <input
            type="date"
            className="border rounded-md px-3 py-2 w-full"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Relacionado a</label>
          <select
            className="border rounded-md px-3 py-2 w-full"
            value={tipoRef}
            onChange={(e) => setTipoRef(e.target.value)}
          >
            <option value="">Nenhum</option>
            <option value="lead">Lead</option>
            <option value="cliente">Cliente</option>
          </select>
        </div>

        {tipoRef && (
          <div>
            <label className="block text-sm font-medium">Selecione</label>
            <select
              className="border rounded-md px-3 py-2 w-full"
              value={idRef}
              onChange={(e) => setIdRef(e.target.value)}
            >
              <option value="">Escolher...</option>
              {listaRef.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={salvar}
          className="px-4 py-2 bg-black text-white rounded-md"
        >
          Salvar Tarefa
        </button>
      </div>
    </Layout>
  );
}
