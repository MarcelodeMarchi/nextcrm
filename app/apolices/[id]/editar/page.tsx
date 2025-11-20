"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditarApolicePage() {
  const { id } = useParams();
  const router = useRouter();

  const [apolice, setApolice] = useState<any>(null);

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
    alert("Apólice atualizada!");
    router.push(`/apolices/${id}`);
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
      <h1 className="text-2xl font-bold mb-6">Editar Apólice</h1>

      <div className="bg-white border rounded shadow p-6 space-y-4 max-w-xl">

        {/* Número */}
        <div>
          <label className="block text-sm font-medium">Número</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={apolice.numero}
            onChange={(e) =>
              setApolice({ ...apolice, numero: e.target.value })
            }
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium">Tipo</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={apolice.tipo}
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
            className="border rounded px-3 py-2 w-full"
            value={apolice.seguradora}
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
            className="border rounded px-3 py-2 w-full"
            value={apolice.premio}
            onChange={(e) =>
              setApolice({ ...apolice, premio: e.target.value })
            }
          />
        </div>

        {/* BOTÕES */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={salvar}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Salvar
          </button>

          <button
            onClick={() => router.push(`/apolices/${id}`)}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Layout>
  );
}
