"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

export default function EditarApolicePage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [apolice, setApolice] = useState<any>(null);

  const [numero, setNumero] = useState("");
  const [tipo, setTipo] = useState("");
  const [seguradora, setSeguradora] = useState("");
  const [premio, setPremio] = useState("");
  const [moeda, setMoeda] = useState("USD");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [notas, setNotas] = useState("");

  // Carregar dados da apólice
  useEffect(() => {
    const carregar = async () => {
      const ref = doc(db, "todasApolices", id as string);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        router.replace("/apolices");
        return;
      }

      const data = snap.data();
      setApolice({ id, ...data });

      // Preencher formulário
      setNumero(data.numero);
      setTipo(data.tipo);
      setSeguradora(data.seguradora);
      setPremio(String(data.premio));
      setMoeda(data.moeda);
      setInicio(
        data.inicioVigencia?.toDate?.().toISOString().substring(0, 10) || ""
      );
      setFim(
        data.fimVigencia?.toDate?.().toISOString().substring(0, 10) || ""
      );
      setNotas(data.notas || "");

      setLoading(false);
    };

    carregar();
  }, [id, router]);

  const salvar = async () => {
    const novo = {
      numero,
      tipo,
      seguradora,
      premio: Number(premio),
      moeda,
      inicioVigencia: inicio ? new Date(inicio) : null,
      fimVigencia: fim ? new Date(fim) : null,
      notas,
    };

    // Atualizar na coleção unificada
    await updateDoc(doc(db, "todasApolices", id as string), novo);

    // Atualizar também na coleção do lead/cliente
    await updateDoc(
      doc(db, apolice.refTipo === "lead" ? "leads" : "clientes", apolice.refId, "apolices", id as string),
      novo
    );

    alert("Apólice atualizada com sucesso!");
    router.push(`/apolices/${id}`);
  };

  if (loading) {
    return (
      <Layout>
        <p>Carregando...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">
        Editar Apólice — {apolice.numero}
      </h1>

      <div className="space-y-4 max-w-lg">

        <div>
          <label className="block text-sm font-medium">Número</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Seguradora</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={seguradora}
            onChange={(e) => setSeguradora(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Tipo</label>
          <select
            className="border rounded px-3 py-2 w-full"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="vida">Vida</option>
            <option value="saude">Saúde</option>
            <option value="residencial">Residencial</option>
            <option value="comercial">Comercial</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Prêmio</label>
            <input
              type="number"
              className="border rounded px-3 py-2 w-full"
              value={premio}
              onChange={(e) => setPremio(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Moeda</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={moeda}
              onChange={(e) => setMoeda(e.target.value)}
            >
              <option value="USD">USD</option>
              <option value="BRL">BRL</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Início da Vigência</label>
            <input
              type="date"
              className="border rounded px-3 py-2 w-full"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Fim da Vigência</label>
            <input
              type="date"
              className="border rounded px-3 py-2 w-full"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Notas</label>
          <textarea
            className="border rounded px-3 py-2 w-full"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </div>

        <button
          onClick={salvar}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Salvar Alterações
        </button>

      </div>
    </Layout>
  );
}
