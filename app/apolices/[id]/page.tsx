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

  // 🔵 LISTA DE SEGURADORAS
  const seguradoras = ["Pan American", "National", "Prudential", "John Hancock"];

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

    // 🔄 Atualizar também no cliente/lead
    if (apolice.refTipo && apolice.refId) {
      await updateDoc(
        doc(db, apolice.refTipo === "lead" ? "leads" : "clientes", apolice.refId, "apolices", id as string),
        apolice
      );
    }

    alert("Apólice salva!");
    setEditando(false);
  };

  const excluir = async () => {
    if (!confirm("Tem certeza que deseja excluir esta apólice?")) return;

    await deleteDoc(doc(db, "todasApolices", id as string));

    // ❗ Remover também do cliente/lead
    if (apolice.refTipo && apolice.refId) {
      await deleteDoc(
        doc(db, apolice.refTipo === "lead" ? "leads" : "clientes", apolice.refId, "apolices", id as string)
      );
    }

    alert("Apólice excluída!");
    router.push("/apolices");
  };

  const enviarWhats = (numero: string) => {
    const digits = numero.replace(/\D/g, "");
    if (!digits) return alert("Cliente sem telefone!");

    window.open(`https://wa.me/1${digits}`, "_blank");
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
            className="border rounded px-3 py-2 w-full"
            disabled={!editando}
            value={apolice.numero}
            onChange={(e) => setApolice({ ...apolice, numero: e.target.value })}
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium">Tipo</label>
          <select
            className="border rounded px-3 py-2 w-full"
            disabled={!editando}
            value={apolice.tipo}
            onChange={(e) => setApolice({ ...apolice, tipo: e.target.value })}
          >
            <option value="vida">Vida</option>
            <option value="saude">Saúde</option>
            <option value="residencial">Residencial</option>
            <option value="comercial">Comercial</option>
          </select>
        </div>

        {/* Seguradora (com filtro datalist) */}
        <div>
          <label className="block text-sm font-medium">Seguradora</label>
          <input
            list="listaSeguradoras"
            className="border rounded px-3 py-2 w-full"
            disabled={!editando}
            value={apolice.seguradora || ""}
            onChange={(e) => setApolice({ ...apolice, seguradora: e.target.value })}
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
            className="border rounded px-3 py-2 w-full"
            disabled={!editando}
            value={apolice.premio}
            onChange={(e) => setApolice({ ...apolice, premio: e.target.value })}
          />
        </div>

        {/* Vigência */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Início</label>
            <input
              type="date"
              disabled={!editando}
              className="border rounded px-3 py-2 w-full"
              value={
                apolice.inicioVigencia?.toDate
                  ? apolice.inicioVigencia.toDate().toISOString().slice(0, 10)
                  : ""
              }
              onChange={(e) =>
                setApolice({ ...apolice, inicioVigencia: new Date(e.target.value) })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Fim</label>
            <input
              type="date"
              disabled={!editando}
              className="border rounded px-3 py-2 w-full"
              value={
                apolice.fimVigencia?.toDate
                  ? apolice.fimVigencia.toDate().toISOString().slice(0, 10)
                  : ""
              }
              onChange={(e) =>
                setApolice({ ...apolice, fimVigencia: new Date(e.target.value) })
              }
            />
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium">Notas</label>
          <textarea
            className="border rounded px-3 py-2 w-full"
            rows={3}
            disabled={!editando}
            value={apolice.notas || ""}
            onChange={(e) => setApolice({ ...apolice, notas: e.target.value })}
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

          {/* WhatsApp */}
          {apolice.telefoneCliente && (
            <button
              onClick={() => enviarWhats(apolice.telefoneCliente)}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              WhatsApp
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
            className="px-4 py-2 bg-red-600 text-white rounded ml-auto"
          >
            Excluir
          </button>
        </div>

      </div>
    </Layout>
  );
}
