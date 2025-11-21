"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export default function ApolicePage() {
  const { id } = useParams();
  const router = useRouter();

  const [apolice, setApolice] = useState<any>(null);
  const [editando, setEditando] = useState(false);

  const seguradoras = [
    "Pan American",
    "National",
    "Prudential",
    "John Hancock"
  ];

  useEffect(() => {
    const carregar = async () => {
      const ref = doc(db, "todasApolices", id as string);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        router.replace("/apolices");
        return;
      }

      setApolice({ id, ...snap.data() });
    };

    carregar();
  }, [id, router]);

  const salvar = async () => {
    await updateDoc(doc(db, "todasApolices", id as string), apolice);
    alert("Apólice salva!");
    setEditando(false);
  };

  const excluir = async () => {
    if (!confirm("Confirmar exclusão da apólice?")) return;
    await deleteDoc(doc(db, "todasApolices", id as string));
    alert("Apólice excluída!");
    router.push("/apolices");
  };

  const abrirWhatsApp = () => {
    if (!apolice.clienteTelefone) return alert("Cliente sem telefone!");

    const numero = apolice.clienteTelefone.replace(/\D/g, "");
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
      <h1 className="text-2xl font-bold mb-4">Apólice</h1>

      <div className="bg-white border rounded shadow p-6 space-y-4 max-w-xl">

        {/* Número */}
        <div>
          <label className="block text-sm font-medium">Número</label>
          <input
            disabled={!editando}
            className="border rounded px-3 py-2 w-full"
            value={apolice.numero || ""}
            onChange={(e) =>
              setApolice({ ...apolice, numero: e.target.value })
            }
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium">Tipo</label>
          <input
            disabled={!editando}
            className="border rounded px-3 py-2 w-full"
            value={apolice.tipo || ""}
            onChange={(e) =>
              setApolice({ ...apolice, tipo: e.target.value })
            }
          />
        </div>

        {/* Seguradora */}
        <div>
          <label className="block text-sm font-medium">Seguradora</label>
          <input
            list="listaSeguradoras"
            disabled={!editando}
            className="border rounded px-3 py-2 w-full"
            value={apolice.seguradora || ""}
            onChange={(e) =>
              setApolice({ ...apolice, seguradora: e.target.value })
            }
          />
          <datalist id="listaSeguradoras">
            {seguradoras.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        {/* Prêmio */}
        <div>
          <label className="block text-sm font-medium">Prêmio</label>
          <input
            disabled={!editando}
            className="border rounded px-3 py-2 w-full"
            value={apolice.premio || ""}
            onChange={(e) =>
              setApolice({ ...apolice, premio: e.target.value })
            }
          />
        </div>

        {/* Vigência */}
        <div>
          <label className="block text-sm font-medium">Vigência</label>
          <p className="text-sm">
            {apolice.inicioVigencia || "-"} — {apolice.fimVigencia || "-"}
          </p>
        </div>

        {/* CLIENTE */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium">Cliente</label>

          <div
            className="cursor-pointer text-blue-600 font-semibold underline"
            onClick={() => router.push(`/clientes/${apolice.clienteId}`)}
          >
            {apolice.clienteNome}
          </div>

          <p className="text-xs text-gray-600">{apolice.clienteTelefone}</p>

          {/* Botão WhatsApp quadrado */}
          <button
            onClick={abrirWhatsApp}
            className="mt-2 bg-green-500 px-3 py-2 rounded text-white font-bold"
          >
            WhatsApp
          </button>
        </div>

        {/* Botões */}
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
            onClick={() => router.push("/apolices")}
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
