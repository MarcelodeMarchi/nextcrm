"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ApolicePage() {
  const { id } = useParams();
  const router = useRouter();

  const [apolice, setApolice] = useState<any>(null);
  const [cliente, setCliente] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const ref = doc(db, "todasApolices", id as string);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        router.replace("/apolices");
        return;
      }

      const dados = snap.data();
      setApolice({ id, ...dados });

      // Carregar cliente vinculado
      if (dados.refTipo && dados.refId) {
        const col = dados.refTipo === "lead" ? "leads" : "clientes";
        const snapC = await getDoc(doc(db, col, dados.refId));

        if (snapC.exists()) {
          setCliente({ id: dados.refId, ...snapC.data() });
        }
      }
    };

    load();
  }, [id, router]);

  const abrirWhatsApp = () => {
    if (!cliente?.telefone) return alert("Cliente sem telefone cadastrado!");

    const numero = cliente.telefone.replace(/\D/g, "");
    if (!numero) return;

    window.open(`https://wa.me/1${numero}`, "_blank");
  };

  if (!apolice) {
    return (
      <Layout>
        <p>Carregando...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Apólice</h1>

      <div className="bg-white border rounded shadow p-6 space-y-4 max-w-xl">

        <div>
          <p className="text-sm text-gray-500">Número</p>
          <p className="text-lg font-semibold">{apolice.numero}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Tipo</p>
          <p className="text-lg font-semibold capitalize">{apolice.tipo}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Seguradora</p>
          <p className="text-lg font-semibold">{apolice.seguradora}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Prêmio</p>
          <p className="text-lg font-semibold">
            {apolice.moeda} {apolice.premio}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Vigência</p>
          <p className="text-lg font-medium">
            {apolice.inicioVigencia?.toDate?.().toLocaleDateString()} —
            {` `}
            {apolice.fimVigencia?.toDate?.().toLocaleDateString()}
          </p>
        </div>

        {apolice.notas && (
          <div>
            <p className="text-sm text-gray-500">Notas</p>
            <p className="text-gray-800 whitespace-pre-line">{apolice.notas}</p>
          </div>
        )}

        {/* CLIENTE / LEAD BLOCO CORRIGIDO */}
        {cliente && (
          <div className="border-t pt-4">
            <p className="text-sm text-gray-500">Cliente</p>

            {/* Nome do cliente */}
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

            {/* WhatsApp */}
            <button
              onClick={abrirWhatsApp}
              className="mt-1 text-green-600 underline font-semibold text-sm"
            >
              Abrir WhatsApp
            </button>
          </div>
        )}

        {/* Botões finais */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => router.push(`/apolices/${id}/editar`)}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Editar
          </button>

          <button
            onClick={() => router.push("/apolices")}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Voltar
          </button>
        </div>
      </div>
    </Layout>
  );
}
