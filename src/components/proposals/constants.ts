
import { ProposalStatus } from "@/types/proposal";

export const statusStyles: Record<ProposalStatus, { bg: string; text: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-800" },
  sent: { bg: "bg-blue-100", text: "text-blue-800" },
  approved: { bg: "bg-green-100", text: "text-green-800" },
  rejected: { bg: "bg-red-100", text: "text-red-800" },
  expired: { bg: "bg-yellow-100", text: "text-yellow-800" },
  new: { bg: "bg-purple-100", text: "text-purple-800" },
  review: { bg: "bg-indigo-100", text: "text-indigo-800" },
  negotiation: { bg: "bg-orange-100", text: "text-orange-800" },
  accepted: { bg: "bg-emerald-100", text: "text-emerald-800" }
};

export const statusLabels: Record<ProposalStatus, string> = {
  draft: 'Taslak',
  sent: 'Gönderildi',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
  expired: 'Süresi Doldu',
  new: 'Yeni',
  review: 'İncelemede',
  negotiation: 'Görüşme',
  accepted: 'Kabul Edildi'
};
