import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, deleteDoc, getDoc } from "firebase/firestore";

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const id = context.params.id;

  try {
    // 1. Ler a apólice na coleção unificada
    const snap = await getDoc(doc(db, "todasApolices", id));

    if (!snap.exists()) {
      return NextResponse.json(
        { error: "Apólice não encontrada" },
        { status: 404 }
      );
    }

    const data = snap.data();

    const refTipo = data.refTipo; // "lead" ou "cliente"
    const refId = data.refId;

    // 2. Excluir na subcoleção correta
    const subRef = doc(
      db,
      refTipo === "lead" ? "leads" : "clientes",
      refId,
      "apolices",
      id
    );

    await deleteDoc(subRef);

    // 3. Excluir da coleção global
    await deleteDoc(doc(db, "todasApolices", id));

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
