
// Shared types for compatibility between different modules

// Define proposal statuses that work across the application
export type ProposalStatusShared = 
  | "draft"
  | "pending_approval" 
  | "sent" 
  | "accepted" 
  | "rejected" 
  | "expired"
  | "gonderildi"  // Turkish variant
  | "onay_bekliyor" // Turkish variant
  | "hazirlaniyor" // Turkish variant
  | "preparing" // English variant added for compatibility
  | "pending"; // English variant added for compatibility

// Map opportunity/deal status to proposal status when needed
export const mapOpportunityToProposalStatus = (status: string): ProposalStatusShared => {
  const statusMap: Record<string, ProposalStatusShared> = {
    "new": "draft",
    "first_contact": "draft",
    "site_visit": "draft",
    "preparing_proposal": "pending_approval",
    "proposal_sent": "sent",
    "accepted": "accepted",
    "lost": "rejected"
  };
  
  return statusMap[status] || "draft";
};
