"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import Link from "next/link";

export default function ApolicePage() {
  const { id } = useParams();
  const router = useRouter();

  const [apolice, setApolice] = useState<any>(null);
  const [cliente, setCliente] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "todasApolices", id as string));

      if (snap.exists()) {
        const dados = { id, ...snap.data() };
        setApolice(dados);

        // Carregar dados do cliente vinculado
        if (dados.refTipo && dados.refId) {
          const col = dados.refTipo === "lead" ? "leads" : "clientes";
          const snapC = await getDoc(doc(db, col, dados.refId));

          if (snapC.exists()) {
            setCliente({ id: dados.refId, ...snapC.data() });
          }
        }
      }
    };

    load();
  }, [id]);

  const excluir = async () => {
    if (!confirm("Excluir esta apólice?")) return;

    // 1. remove da coleção global
    await deleteDoc(doc(db, "todasApolices", id as string));

    // 2. remove da subcoleção correta
    if (apolice) {
      const col = apolice.refTipo === "lead" ? "leads" : "clientes";
      await deleteDoc(doc(db, col, apolice.refId, "apolices", id as string));
    }

    alert("Apólice excluída.");
    router.push("/apolices");
  };

  if (!apolice) return <Layout>Carregando apólice...</Layout>;

  const format = (d: any) => {
    if (!d) return "-";
    const date = d.toDate ? d.toDate() : new Date(d);
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">
        Apólice {apolice.numero}
      </h1>

      <div className="bg-white border rounded shadow p-4 space-y-4 max-w-xl">

        {/* Número */}
        <p><strong>Número:</strong> {apolice.numero}</p>

        {/* Tipo */}
        <p><strong>Tipo:</strong> {apolice.tipo}</p>

        {/* Seguradora */}
        <p><strong>Seguradora:</strong> {apolice.seguradora}</p>

        {/* Prêmio */}
        <p>
          <strong>Prêmio:</strong>{" "}
          {apolice.moeda === "USD" ? "$" : "R$"}
          {apolice.premio}
        </p>

        {/* Vigência */}
        <p>
          <strong>Vigência:</strong> {format(apolice.inicioVigencia)} →{" "}
          {format(apolice.fimVigencia)}
        </p>

        {/* Notas */}
        {apolice.notas && (
          <p>
            <strong>Notas:</strong> {apolice.notas}
          </p>
        )}

        {/* CLIENTE / LEAD VINCULADO */}
        {cliente && (
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-2">
              Dados do {apolice.refTipo === "lead" ? "Lead" : "Cliente"}
            </h2>

            <p><strong>Nome:</strong> {cliente.nome}</p>
            <p><strong>Telefone:</strong> {cliente.telefone}</p>
            <p><strong>Email:</strong> {cliente.email}</p>

            <Link
              href={`/${apolice.refTipo === "lead" ? "leads" : "clientes"}/${cliente.id}`}
              className="text-blue-600 underline mt-2 inline-block"
            >
              Abrir Cadastro →
            </Link>
          </div>
        )}

        {/* BOTÕES */}
        <div className="flex gap-3 mt-4">
          <Link
            href={`/apolices/${id}/editar`}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Editar
          </Link>

          <button
            onClick={excluir}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Excluir Apólice
          </button>
        </div>
      </div>
    </Layout>
  );
}
