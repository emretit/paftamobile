
import { ProposalStatus } from "@/types/crm";

// Map proposal status to user-friendly labels
export const proposalStatusLabels: Record<ProposalStatus, string> = {
  draft: "Hazırlanıyor",
  pending_approval: "Onay Bekliyor",
  sent: "Gönderildi",
  accepted: "Kabul Edildi",
  rejected: "Reddedildi",
  expired: "Süresi Doldu"
};

// Map proposal status to colors for UI
export const proposalStatusColors: Record<ProposalStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  pending_approval: "bg-blue-100 text-blue-800",
  sent: "bg-indigo-100 text-indigo-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  expired: "bg-amber-100 text-amber-800"
};

// Export alias for backward compatibility
export const statusLabels = proposalStatusLabels;
export const statusStyles = proposalStatusColors;
export const primaryProposalStatuses: ProposalStatus[] = ["draft", "pending_approval", "sent", "accepted"];
export const workflowSteps: ProposalStatus[] = ["draft", "pending_approval", "sent", "accepted"];
export const finalStages: ProposalStatus[] = ["accepted", "rejected", "expired"];
