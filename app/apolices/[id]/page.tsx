"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";

// Tipo da apólice
type Apolice = {
  id: string;
  numero: string;
  tipo: string;
  seguradora: string;
  premio: number;
  moeda: string;
  inicioVigencia: any;
  fimVigencia: any;
  notas?: string;

  refTipo: "lead" | "cliente";
  refId: string;
  refNome?: string;
};

export default function ApolicePage() {
  const { id } = useParams();
  const router = useRouter();

  const [apolice, setApolice] = useState<Apolice | null>(null);
  const [cliente, setCliente] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const ref = doc(db, "todasApolices", id as string);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;

      const raw = snap.data() as any;

      const ap: Apolice = {
        id: id as string,
        numero: raw.numero || "",
        tipo: raw.tipo || "",
        seguradora: raw.seguradora || "",
        premio: raw.premio || 0,
        moeda: raw.moeda || "USD",
        inicioVigencia: raw.inicioVigencia || null,
        fimVigencia: raw.fimVigencia || null,
        notas: raw.notas || "",

        refTipo: raw.refTipo,
        refId: raw.refId,
        refNome: raw.refNome || "",
      };

      setApolice(ap);

      // Carregar o cliente vinculado
      if (ap.refTipo && ap.refId) {
        const col = ap.refTipo === "lead" ? "leads" : "clientes";
        const snapC = await getDoc(doc(db, col, ap.refId));

        if (snapC.exists()) {
          setCliente({
            id: ap.refId,
            ...snapC.data(),
          });
        }
      }
    };

    load();
  }, [id]);

  const deletar = async () => {
    if (!confirm("Tem certeza que deseja excluir esta apólice?")) return;

    await deleteDoc(doc(db, "todasApolices", id as string));

    if (apolice) {
      const col = apolice.refTipo === "lead" ? "leads" : "clientes";
      await deleteDoc(doc(db, col, apolice.refId, "apolices", id as string));
    }

    alert("Apólice excluída!");
    router.push("/apolices");
  };

  if (!apolice) return <Layout>Carregando...</Layout>;

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Apólice #{apolice.numero}</h1>

      <div className="bg-white border rounded shadow p-6 space-y-4 max-w-2xl">
        
        <p><strong>Tipo:</strong> {apolice.tipo}</p>
        <p><strong>Seguradora:</strong> {apolice.seguradora}</p>
        <p><strong>Prêmio:</strong> {apolice.moeda} {apolice.premio}</p>

        <p>
          <strong>Início Vigência:</strong>{" "}
          {apolice.inicioVigencia?.toDate().toLocaleDateString()}
        </p>

        <p>
          <strong>Fim Vigência:</strong>{" "}
          {apolice.fimVigencia?.toDate().toLocaleDateString()}
        </p>

        <p><strong>Notas:</strong> {apolice.notas || "—"}</p>

        <hr />

        {/* Cliente / Lead vinculado */}
        {cliente && (
          <div className="bg-gray-50 p-4 rounded border">
            <h2 className="font-semibold mb-2">Cliente / Lead vinculado</h2>

            <p><strong>Nome:</strong> {cliente.nome}</p>
            <p><strong>Telefone:</strong> {cliente.telefone}</p>
            <p><strong>E-mail:</strong> {cliente.email}</p>

            <button
              className="mt-3 px-3 py-1 bg-black text-white rounded"
              onClick={() =>
                router.push(
                  `/${apolice.refTipo === "lead" ? "leads" : "clientes"}/${cliente.id}`
                )
              }
            >
              Abrir cadastro
            </button>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            className="px-4 py-2 bg-black text-white rounded"
            onClick={() => router.push(`/apolices/${id}/editar`)}
          >
            Editar
          </button>

          <button
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={deletar}
          >
            Excluir
          </button>
        </div>
      </div>
    </Layout>
  );
}
