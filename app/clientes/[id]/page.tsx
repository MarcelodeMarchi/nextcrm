"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import Link from "next/link";

export default function ClientePage() {
  const { id } = useParams();
  const router = useRouter();

  const [cliente, setCliente] = useState<any>(null);
  const [apolices, setApolices] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "clientes", id as string));
      if (snap.exists()) {
        setCliente({ id, ...snap.data() });
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    const q = query(
      collection(db, "clientes", id as string, "apolices"),
      orderBy("inicioVigencia", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setApolices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return unsub;
  }, [id]);

  const salvar = async () => {
    if (!cliente) return;

    await updateDoc(doc(db, "clientes", id as string), {
      nome: cliente.nome || "",
      telefone: cliente.telefone || "",
      email: cliente.email || "",
      seguradora: cliente.seguradora || "",
      origem: cliente.origem || "",
      agente: cliente.agente || "",
      primeiroContato: cliente.primeiroContato || null,
      observacoes: cliente.observacoes || "",
      atualizadoEm: new Date(),
    });

    alert("Cliente atualizado com sucesso!");
  };

  const excluir = async () => {
    if (
      !confirm(
        "Tem certeza que deseja excluir ESTE CLIENTE e TODAS SUAS APÓLICES?"
      )
    )
      return;

    // 🔴 1. excluir apólices da subcoleção
    const sub = collection(db, "clientes", id as string, "apolices");
    const snap = await getDoc(doc(db, "clientes", id as string));

    for (const ap of apolices) {
      await deleteDoc(doc(sub, ap.id));
      await deleteDoc(doc(db, "todasApolices", ap.id));
    }

    // 🔴 2. excluir cliente
    await deleteDoc(doc(db, "clientes", id as string));

    alert("Cliente excluído com sucesso!");
    router.push("/clientes");
  };

  if (!cliente) return <Layout>Carregando cliente...</Layout>;

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">
        Cliente — {cliente.nome}
      </h1>

      <div className="space-y-4 max-w-xl bg-white border shadow p-4 rounded">
        {/* NOME */}
        <div>
          <label>Nome</label>
          <input
            className="border rounded w-full p-2"
            value={cliente.nome}
            onChange={(e) =>
              setCliente({ ...cliente, nome: e.target.value })
            }
          />
        </div>

        {/* TELEFONE */}
        <div>
          <label>Telefone</label>
          <input
            className="border rounded w-full p-2"
            value={cliente.telefone}
            onChange={(e) =>
              setCliente({ ...cliente, telefone: e.target.value })
            }
          />
        </div>

        {/* EMAIL */}
        <div>
          <label>Email</label>
          <input
            className="border rounded w-full p-2"
            value={cliente.email}
            onChange={(e) =>
              setCliente({ ...cliente, email: e.target.value })
            }
          />
        </div>

        {/* SEGURADORA */}
        <div>
          <label>Seguradora</label>
          <select
            className="border rounded w-full p-2"
            value={cliente.seguradora}
            onChange={(e) =>
              setCliente({ ...cliente, seguradora: e.target.value })
            }
          >
            <option value="">Selecionar</option>
            <option value="Pan American">Pan American</option>
            <option value="National">National</option>
          </select>
        </div>

        {/* ORIGEM */}
        <div>
          <label>Origem</label>
          <input
            className="border rounded w-full p-2"
            value={cliente.origem || ""}
            onChange={(e) =>
              setCliente({ ...cliente, origem: e.target.value })
            }
          />
        </div>

        {/* AGENTE */}
        <div>
          <label>Agente</label>
          <input
            className="border rounded w-full p-2"
            value={cliente.agente || ""}
            onChange={(e) =>
              setCliente({ ...cliente, agente: e.target.value })
            }
          />
        </div>

        {/* PRIMEIRO CONTATO */}
        <div>
          <label>Primeiro Contato</label>
          <input
            type="date"
            className="border rounded w-full p-2"
            value={cliente.primeiroContato || ""}
            onChange={(e) =>
              setCliente({
                ...cliente,
                primeiroContato: e.target.value,
              })
            }
          />
        </div>

        {/* OBSERVAÇÕES */}
        <div>
          <label>Observações</label>
          <textarea
            className="border rounded w-full p-2"
            rows={4}
            value={cliente.observacoes || ""}
            onChange={(e) =>
              setCliente({
                ...cliente,
                observacoes: e.target.value,
              })
            }
          />
        </div>

        {/* BOTÕES */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={salvar}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Salvar
          </button>

          <button
            onClick={excluir}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Excluir Cliente
          </button>
        </div>
      </div>

      {/* LISTA DE APÓLICES */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-3">Apólices</h2>

        <div className="bg-white border rounded shadow p-4">
          {apolices.length === 0 && (
            <p className="text-gray-600">Nenhuma apólice.</p>
          )}

          {apolices.map((ap) => (
            <div
              key={ap.id}
              className="border-b py-2 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{ap.numero}</p>
                <p className="text-xs text-gray-500">
                  {ap.tipo} — {ap.seguradora}
                </p>
              </div>

              <Link
                href={`/apolices/${ap.id}`}
                className="text-blue-600 underline"
              >
                Abrir
              </Link>
            </div>
          ))}
        </div>

        <Link
          href={`/clientes/${id}/nova-apolice`}
          className="mt-4 inline-block bg-black text-white px-4 py-2 rounded"
        >
          ➕ Nova Apólice
        </Link>
      </div>
    </Layout>
  );
}
