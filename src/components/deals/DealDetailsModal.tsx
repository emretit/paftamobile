
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Deal {
  id: string;
  title: string;
  description?: string;
  value: number;
  status: "new" | "negotiation" | "follow_up" | "won" | "lost";
  priority: "low" | "medium" | "high";
  customerName: string;
  employeeName: string;
  expectedCloseDate?: Date;
  proposalDate: Date;
  lastContactDate: Date;
  notes?: string;
  internalComments?: string;
}

interface DealDetailsModalProps {
  deal: Deal | null;
  isOpen: boolean;
  onClose: () => void;
}

const DealDetailsModal = ({ deal, isOpen, onClose }: DealDetailsModalProps) => {
  if (!deal) return null;

  const formatDate = (date: Date) => {
    return format(new Date(date), 'PP');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: "bg-blue-100 text-blue-700",
      negotiation: "bg-yellow-100 text-yellow-700",
      follow_up: "bg-purple-100 text-purple-700",
      won: "bg-green-100 text-green-700",
      lost: "bg-red-100 text-red-700",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "bg-red-100 text-red-700",
      medium: "bg-yellow-100 text-yellow-700",
      low: "bg-green-100 text-green-700",
    };
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Deal Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] pr-4">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{deal.title}</h2>
                <p className="text-gray-600">{deal.customerName}</p>
              </div>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(deal.status)}`}>
                  {deal.status.replace('_', ' ')}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(deal.priority)}`}>
                  {deal.priority}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="font-medium text-gray-600 mb-1">Deal Value</h3>
                <p className="text-xl font-bold">${deal.value.toLocaleString()}</p>
              </Card>
              <Card className="p-4">
                <h3 className="font-medium text-gray-600 mb-1">Sales Rep</h3>
                <p className="text-xl">{deal.employeeName}</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium text-gray-600 mb-1">Proposal Date</h3>
                <p>{formatDate(deal.proposalDate)}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-600 mb-1">Last Contact</h3>
                <p>{formatDate(deal.lastContactDate)}</p>
              </div>
              {deal.expectedCloseDate && (
                <div>
                  <h3 className="font-medium text-gray-600 mb-1">Expected Close</h3>
                  <p>{formatDate(deal.expectedCloseDate)}</p>
                </div>
              )}
            </div>

            {deal.description && (
              <div>
                <h3 className="font-medium text-gray-600 mb-2">Description</h3>
                <p className="text-gray-700">{deal.description}</p>
              </div>
            )}

            {deal.notes && (
              <div>
                <h3 className="font-medium text-gray-600 mb-2">Notes</h3>
                <p className="text-gray-700 whitespace-pre-line">{deal.notes}</p>
              </div>
            )}

            {deal.internalComments && (
              <div>
                <h3 className="font-medium text-gray-600 mb-2">Internal Comments</h3>
                <p className="text-gray-700 whitespace-pre-line">{deal.internalComments}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DealDetailsModal;
