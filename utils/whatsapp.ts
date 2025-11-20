// Normaliza telefone Brasil + EUA
export function formatPhoneForWhatsApp(raw: string | undefined | null) {
  if (!raw) return "";

  // Remove tudo que não é número
  const n = raw.replace(/\D/g, "");

  // 🇺🇸 EUA — 10 dígitos → +1
  if (n.length === 10) return "1" + n;

  // 🇺🇸 EUA — 11 dígitos começando com 1 → OK
  if (n.length === 11 && n.startsWith("1")) return n;

  // 🇧🇷 Brasil — 11 dígitos (celular com DDD)
  if (n.length === 11 && !n.startsWith("1")) return "55" + n;

  // 🇧🇷 Brasil — 10 dígitos → fixo → também +55
  if (n.length === 10) return "55" + n;

  // 🇧🇷 Brasil — já com 55
  if (n.startsWith("55")) return n;

  // fallback
  return n;
}

// Gera link WhatsApp. Vem desativado se telefone inválido.
export function getWhatsAppLink(raw: string | undefined | null, msg = "") {
  const formatted = formatPhoneForWhatsApp(raw);

  if (!formatted || formatted.length < 10) return null;

  return `https://wa.me/${formatted}?text=${encodeURIComponent(msg)}`;
}
