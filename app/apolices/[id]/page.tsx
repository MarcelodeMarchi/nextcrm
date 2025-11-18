"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function ApoliceDetalhe() {
  const { id } = useParams();
  const router = useRouter();
  const [apolice, setApolice] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "todasApolices", id as string));
      if (!snap.exists()) {
        router.push("/apolices");
        return;
      }
      setApolice({ id, ...snap.data() });
    };
    load();
  }, [id, router]);

  if (!apolice) {
    return (
      <Layout>
        <p>Carregando apólice...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">
        Apólice {apolice.numero}
      </h1>

      <div className="space-y-3 bg-white border rounded-lg p-5 max-w-2xl">

        <p><strong>Seguradora:</strong> {apolice.seguradora}</p>
        <p><strong>Tipo:</strong> {apolice.tipo}</p>
        <p>
          <strong>Prêmio:</strong>{" "}
          {apolice.moeda === "USD" ? "$" : "R$"} {apolice.premio}
        </p>

        <p>
          <strong>Vigência:</strong> 
          {apolice.inicioVigencia?.toDate?.().toLocaleDateString()} 
          {" → "} 
          {apolice.fimVigencia?.toDate?.().toLocaleDateString()}
        </p>

        <Link
          href={`/apolices/${apolice.id}/editar`}
          className="px-4 py-2 bg-black text-white rounded-md"
          >
          Editar Apólice
        </Link>
<button
  onClick={async () => {
    if (!confirm("Tem certeza que deseja excluir esta apólice? Essa ação não pode ser desfeita.")) {
      return;
    }

    // Chama a função de exclusão
    await fetch(`/api/apolices/${apolice.id}`, { method: "DELETE" });
    alert("Apólice excluída com sucesso!");
    router.push("/apolices");
  }}
  className="px-4 py-2 bg-red-600 text-white rounded ml-4"
>
  Excluir Apólice
</button>

        <p>
          <strong>Cliente:</strong>{" "}
          <Link
            className="text-blue-600"
            href={`/${apolice.refTipo === "lead" ? "leads" : "clientes"}/${apolice.refId}`}
          >
            {apolice.refNome}
          </Link>
        </p>

        {apolice.notas && (
          <p><strong>Notas:</strong> {apolice.notas}</p>
        )}

      </div>

      <div className="mt-6">
        <button className="px-4 py-2 bg-black text-white rounded">
          Editar (em breve)
        </button>
      </div>
    </Layout>
  );
}
