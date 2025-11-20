"use client";

import { getWhatsAppLink } from "@/utils/whatsapp";

export default function WhatsAppButton({
  phone,
  message = "Olá! Vi seus dados no CRM.",
}: {
  phone: string | null | undefined;
  message?: string;
}) {
  const link = getWhatsAppLink(phone, message);

  const disabled = !link;

  return (
    <a
      href={disabled ? undefined : link}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 px-3 py-2 rounded-md shadow text-white transition ${
        disabled
          ? "bg-gray-400 cursor-not-allowed opacity-50"
          : "bg-green-600 hover:bg-green-700"
      }`}
    >
      💬 WhatsApp
    </a>
  );
}
