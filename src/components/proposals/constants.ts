

import { ProposalStatus } from "@/types/proposal";
import { ProposalStatusType } from "@/types/crm";

export const statusLabels: Record<ProposalStatus, string> = {
  draft: "Taslak",
  new: "Yeni",
  review: "İncelemede",
  sent: "Gönderildi",
  negotiation: "Müzakerede",
  accepted: "Kabul Edildi",
  rejected: "Reddedildi",
  expired: "Süresi Doldu",
  discovery_scheduled: "Keşif Planlandı",
  meeting_completed: "Görüşme Tamamlandı",
  quote_in_progress: "Teklif Hazırlanıyor",
  quote_sent: "Teklif Gönderildi",
  approved: "Onaylandı",
  converted_to_order: "Siparişe Dönüştü",
  preparing: "Hazırlanıyor",
  pending: "Onay Bekliyor"
};

export const statusStyles: Record<ProposalStatus, { bg: string; text: string }> = {
  draft: { bg: "bg-slate-400", text: "text-white" },
  new: { bg: "bg-blue-400", text: "text-white" },
  review: { bg: "bg-yellow-400", text: "text-black" },
  sent: { bg: "bg-green-400", text: "text-white" },
  negotiation: { bg: "bg-purple-400", text: "text-white" },
  accepted: { bg: "bg-emerald-500", text: "text-white" },
  rejected: { bg: "bg-red-500", text: "text-white" },
  expired: { bg: "bg-gray-500", text: "text-white" },
  discovery_scheduled: { bg: "bg-indigo-400", text: "text-white" },
  meeting_completed: { bg: "bg-cyan-500", text: "text-white" },
  quote_in_progress: { bg: "bg-amber-500", text: "text-white" },
  quote_sent: { bg: "bg-teal-500", text: "text-white" },
  approved: { bg: "bg-green-600", text: "text-white" },
  converted_to_order: { bg: "bg-blue-600", text: "text-white" },
  preparing: { bg: "bg-amber-500", text: "text-white" },
  pending: { bg: "bg-blue-500", text: "text-white" }
};

// Simplified status options for the new proposal flow
export const simplifiedProposalStatuses: ProposalStatusType[] = [
  "preparing",
  "pending",
  "sent"
];

// Workflow steps for the proposal process
export const workflowSteps = [
  { status: 'draft', label: 'Taslak' },
  { status: 'preparing', label: 'Hazırlanıyor' },
  { status: 'pending', label: 'Onay Bekliyor' },
  { status: 'sent', label: 'Gönderildi' },
  { status: 'negotiation', label: 'Müzakerede' },
  { status: 'accepted', label: 'Kabul Edildi' }
] as const;

// Status values that represent final stages of a proposal
export const finalStages = ['accepted', 'rejected', 'expired', 'converted_to_order'] as const;
