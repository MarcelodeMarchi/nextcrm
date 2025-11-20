"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";

export default function ApolicePage() {
  const { id } = useParams();
  const router = useRouter();

  const [apolice, setApolice] = useState<any>(null);
  const [cliente, setCliente] = useState<any>(null);

  useEffect(() => {
    const carregar = async () => {
      const ref = doc(db, "todasApolices", id as string);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        router.replace("/apolices");
        return;
      }

      const dados = snap.data();
      setApolice({ id, ...dados });

      // Carregar cliente/lead vinculado
      if (dados.refTipo && dados.refId) {
        const col = dados.refTipo === "lead" ? "leads" : "clientes";
        const snapC = await getDoc(doc(db, col, dados.refId));

        if (snapC.exists()) {
          setCliente({
            id: dados.refId,
            ...snapC.data(),
          });
        }
      }
    };

    carregar();
  }, [id, router]);

  const excluir = async () => {
    if (!confirm("Confirmar exclusão da apólice?")) return;

    await deleteDoc(doc(db, "todasApolices", id as string));

    if (apolice.refTipo && apolice.refId) {
      const col = apolice.refTipo === "lead" ? "leads" : "clientes";
      await deleteDoc(
        doc(db, col, apolice.refId, "apolices", id as string)
      );
    }

    alert("Apólice excluída!");
    router.push("/apolices");
  };

  const abrirWhatsApp = () => {
    if (!cliente?.telefone)
      return alert("Telefone do cliente não encontrado!");

    const numero = cliente.telefone.replace(/\D/g, "");
    if (!numero) return;

    window.open(`https://wa.me/1${numero}`, "_blank");
  };

  if (!apolice)
    return (
      <Layout>
        <p>Carregando...</p>
      </Layout>
    );

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Apólice</h1>

      <div className="bg-white border rounded shadow p-6 space-y-4 max-w-xl">

        {/* Número */}
        <div>
          <p className="text-sm text-gray-500">Número</p>
          <p className="text-lg font-semibold">{apolice.numero}</p>
        </div>

        {/* Tipo */}
        <div>
          <p className="text-sm text-gray-500">Tipo</p>
          <p className="text-lg font-semibold">{apolice.tipo}</p>
        </div>

        {/* Seguradora */}
        <div>
          <p className="text-sm text-gray-500">Seguradora</p>
          <p className="text-lg font-semibold">{apolice.seguradora}</p>
        </div>

        {/* Prêmio */}
        <div>
          <p className="text-sm text-gray-500">Prêmio</p>
          <p className="text-lg font-semibold">
            {apolice.moeda} {apolice.premio}
          </p>
        </div>

        {/* Vigência */}
        <div>
          <p className="text-sm text-gray-500">Vigência</p>
          <p className="font-medium">
            {apolice.inicioVigencia?.toDate?.().toLocaleDateString()}{" "}
            até{" "}
            {apolice.fimVigencia?.toDate?.().toLocaleDateString()}
          </p>
        </div>

{/* Cliente/Lead */}
{cliente && (
  <div className="border-t pt-4">
    <p className="text-sm text-gray-500">Cliente</p>

    {/* Nome do Cliente (clicável para abrir página do cliente) */}
    <button
      onClick={() => router.push(`/clientes/${cliente.id}`)}
      className="text-blue-600 font-bold underline text-lg text-left"
    >
      {cliente.nome}
    </button>

    {/* Telefone */}
    <p className="text-sm text-gray-600 mt-1">
      {cliente.telefone || "Sem telefone"}
    </p>

    {/* Botão WhatsApp */}
    <button
      onClick={abrirWhatsApp}
      className="mt-1 text-green-600 underline font-semibold text-sm"
    >
      Abrir WhatsApp
    </button>
  </div>
)}

        {/* BOTÕES */}
        <div className="flex gap-3 mt-6">

          <button
            onClick={() => router.push(`/apolices/${id}/editar`)}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Editar
          </button>

          <button
            onClick={() => router.push(`/apolices`)}
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
