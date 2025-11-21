"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function NovaApolicePage() {
  const router = useRouter();
  const params = useSearchParams();

  // Dados enviados pelo cliente
  const clienteId = params.get("clienteId") || "";
  const clienteNome = params.get("clienteNome") || "";
  const clienteTelefone = params.get("clienteTelefone") || "";

  const seguradoras = ["Pan American", "National", "Prudential", "John Hancock"];

  const [numero, setNumero] = useState("");
  const [tipo, setTipo] = useState("vida");
  const [seguradora, setSeguradora] = useState("");
  const [premio, setPremio] = useState("");
  const [moeda, setMoeda] = useState("USD");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [notas, setNotas] = useState("");

  const salvar = async () => {
    if (!clienteId) {
      alert("Erro: Cliente não informado!");
      return;
    }

    if (!numero || !seguradora || !inicio || !fim) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const ref = await addDoc(collection(db, "todasApolices"), {
      numero,
      tipo,
      seguradora,
      premio: Number(premio),
      moeda,
      inicioVigencia: inicio ? new Date(`${inicio}T12:00:00`) : null,
      fimVigencia: fim ? new Date(`${fim}T12:00:00`) : null,
      notas,
      criadoEm: serverTimestamp(),

      // Vínculo com cliente
      clienteId,
      clienteNome,
      clienteTelefone,
    });

    alert("Apólice criada com sucesso!");
    router.push(`/apolices/${ref.id}`);
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Nova Apólice</h1>

      <div className="bg-white shadow border rounded p-6 max-w-xl space-y-4">

        {/* CLIENTE VINCULADO */}
        <div className="border p-3 rounded bg-gray-50">
          <p className="font-medium text-sm">Cliente vinculado:</p>
          <p className="font-bold text-lg">{clienteNome}</p>
          <p className="text-sm text-gray-600">{clienteTelefone}</p>
        </div>

        {/* Número */}
        <div>
          <label className="block text-sm font-medium">Número</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
        </div>

        {/* Tipo */}
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

        {/* Seguradora */}
        <div>
          <label className="block text-sm font-medium">Seguradora</label>
          <input
            list="listaSeguradoras"
            className="border rounded px-3 py-2 w-full"
            value={seguradora}
            onChange={(e) => setSeguradora(e.target.value)}
          />
          <datalist id="listaSeguradoras">
            {seguradoras.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        {/* Prêmio + Moeda */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Prêmio</label>
            <input
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

        {/* Vigência */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Início</label>
            <input
              type="date"
              className="border rounded px-3 py-2 w-full"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Fim</label>
            <input
              type="date"
              className="border rounded px-3 py-2 w-full"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
            />
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium">Notas</label>
          <textarea
            className="border rounded px-3 py-2 w-full"
            rows={3}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <button
            onClick={salvar}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Salvar
          </button>

          <button
            onClick={() => router.push("/apolices")}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Layout>
  );
}
