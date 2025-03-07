
import { ProposalStatus } from "@/types/proposal";

export const statusStyles: Record<ProposalStatus, { bg: string; text: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-800" },
  sent: { bg: "bg-blue-100", text: "text-blue-800" },
  new: { bg: "bg-purple-100", text: "text-purple-800" },
  review: { bg: "bg-indigo-100", text: "text-indigo-800" },
  negotiation: { bg: "bg-orange-100", text: "text-orange-800" },
  approved: { bg: "bg-green-100", text: "text-green-800" },
  accepted: { bg: "bg-emerald-100", text: "text-emerald-800" },
  rejected: { bg: "bg-red-100", text: "text-red-800" },
  expired: { bg: "bg-yellow-100", text: "text-yellow-800" },
  discovery_scheduled: { bg: "bg-blue-100", text: "text-blue-800" },
  meeting_completed: { bg: "bg-indigo-100", text: "text-indigo-800" },
  quote_in_progress: { bg: "bg-violet-100", text: "text-violet-800" },
  quote_sent: { bg: "bg-yellow-100", text: "text-yellow-800" },
  converted_to_order: { bg: "bg-green-100", text: "text-green-800" }
};

export const statusLabels: Record<ProposalStatus, string> = {
  draft: 'Taslak',
  sent: 'Gönderildi',
  new: 'Yeni',
  review: 'İncelemede',
  negotiation: 'Müzakere Aşaması',
  approved: 'Onaylandı',
  accepted: 'Kabul Edildi',
  rejected: 'Reddedildi',
  expired: 'Süresi Doldu',
  discovery_scheduled: 'Keşif Planlandı',
  meeting_completed: 'Görüşme Tamamlandı',
  quote_in_progress: 'Teklif Hazırlanıyor',
  quote_sent: 'Teklif Gönderildi',
  converted_to_order: 'Siparişe Dönüştü'
};

// Define the status workflow stages
export const workflowStages: { status: ProposalStatus; label: string }[] = [
  { status: 'discovery_scheduled', label: 'Keşif Planlandı' },
  { status: 'meeting_completed', label: 'Görüşme Tamamlandı' },
  { status: 'quote_in_progress', label: 'Teklif Hazırlanıyor' },
  { status: 'quote_sent', label: 'Teklif Gönderildi' },
  { status: 'negotiation', label: 'Müzakere Aşaması' }
];

// Define the final stages
export const finalStages: { status: ProposalStatus; label: string }[] = [
  { status: 'approved', label: 'Onaylandı' },
  { status: 'rejected', label: 'Reddedildi' },
  { status: 'converted_to_order', label: 'Siparişe Dönüştü' }
];
