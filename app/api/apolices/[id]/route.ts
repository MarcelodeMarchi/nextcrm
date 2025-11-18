import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, deleteDoc, getDoc } from "firebase/firestore";

export async function DELETE(request: NextRequest, context: any) {
  // PARA NEXT.JS 16 — context.params é uma Promise
  const { id } = await context.params;

  try {
    const snap = await getDoc(doc(db, "todasApolices", id));
    if (!snap.exists()) {
      return NextResponse.json(
        { error: "Apólice não encontrada" },
        { status: 404 }
      );
    }

    const data = snap.data();

    const refTipo = data.refTipo;
    const refId = data.refId;

    const subRef = doc(
      db,
      refTipo === "lead" ? "leads" : "clientes",
      refId,
      "apolices",
      id
    );
    await deleteDoc(subRef);

    await deleteDoc(doc(db, "todasApolices", id));

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("ERRO AO EXCLUIR APÓLICE:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
