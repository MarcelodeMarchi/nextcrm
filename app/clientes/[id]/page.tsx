"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export default function ClientePage() {
  const { id } = useParams();
  const router = useRouter();

  const [cliente, setCliente] = useState<any>(null);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    const carregar = async () => {
      const ref = doc(db, "clientes", id as string);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        router.replace("/clientes");
        return;
      }

      setCliente({ id, ...snap.data() });
    };

    carregar();
  }, [id, router]);

  const salvar = async () => {
    await updateDoc(doc(db, "clientes", id as string), cliente);
    alert("Cliente salvo!");
    setEditando(false);
  };

  const excluir = async () => {
    if (!confirm("Confirmar exclusão do cliente?")) return;

    await deleteDoc(doc(db, "clientes", id as string));
    alert("Cliente excluído!");
    router.push("/clientes");
  };

  const abrirWhatsApp = () => {
    if (!cliente.telefone) return alert("Cliente sem telefone cadastrado!");

    const numero = cliente.telefone.replace(/\D/g, "");
    if (!numero) return;

    window.open(`https://wa.me/1${numero}`, "_blank");
  };

  if (!cliente) {
    return (
      <Layout>
        <p>Carregando...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Cliente</h1>

      <div className="bg-white border rounded shadow p-6 space-y-4 max-w-xl">

        {/* Nome */}
        <div>
          <label className="block text-sm font-medium">Nome</label>
          <input
            className="border rounded px-3 py-2 w-full"
            disabled={!editando}
            value={cliente.nome}
            onChange={(e) =>
              setCliente({ ...cliente, nome: e.target.value })
            }
          />
        </div>

        {/* TELEFONE + BOTÃO WHATSAPP AO LADO */}
        <div>
          <label className="block text-sm font-medium">Telefone</label>

          <div className="flex gap-2 items-center">
            <input
              className="border rounded px-3 py-2 w-full"
              disabled={!editando}
              value={cliente.telefone}
              onChange={(e) =>
                setCliente({ ...cliente, telefone: e.target.value })
              }
            />

            {/* Botão WhatsApp C2 */}
            <button
              onClick={abrirWhatsApp}
              className="px-3 py-2 bg-green-600 text-white rounded-md font-semibold"
              title="Abrir WhatsApp"
            >
              WhatsApp
            </button>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            className="border rounded px-3 py-2 w-full"
            disabled={!editando}
            value={cliente.email || ""}
            onChange={(e) =>
              setCliente({ ...cliente, email: e.target.value })
            }
          />
        </div>

        {/* BOTÕES */}
        <div className="flex gap-3 mt-4">
          {!editando ? (
            <button
              onClick={() => setEditando(true)}
              className="px-4 py-2 bg-black text-white rounded"
            >
              Editar
            </button>
          ) : (
            <button
              onClick={salvar}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Salvar
            </button>
          )}

          <button
            onClick={() => router.push("/clientes")}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Voltar
          </button>

          <button
            onClick={excluir}
            className="ml-auto px-4 py-2 bg-red-600 text-white rounded"
          >
            Excluir
          </button>
        </div>
      </div>
    </Layout>
  );
}
