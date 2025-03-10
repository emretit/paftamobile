
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useLeaveManagement } from "./leave/useLeaveManagement";
import { LeaveBalanceCards } from "./leave/LeaveBalanceCards";
import { LeaveHistoryTable } from "./leave/LeaveHistoryTable";
import { LeaveRequestForm } from "./leave/LeaveRequestForm";
import { LeaveManagementHeader } from "./leave/LeaveManagementHeader";

interface EmployeeLeaveTabProps {
  employeeId: string;
}

export const EmployeeLeaveTab = ({ employeeId }: EmployeeLeaveTabProps) => {
  const {
    leaveHistory,
    leaveBalance,
    isLoading,
    isFormOpen,
    setIsFormOpen,
    form,
    handleSubmit
  } = useLeaveManagement(employeeId);

  const pendingRequestsCount = leaveHistory.filter(record => record.status === 'pending').length;

  return (
    <div className="space-y-6">
      <LeaveManagementHeader onNewLeaveRequest={() => setIsFormOpen(true)} />

      <LeaveBalanceCards 
        leaveBalance={leaveBalance}
        pendingRequestsCount={pendingRequestsCount}
      />

      <Card>
        <CardHeader>
          <CardTitle>İzin Geçmişi & Talepleri</CardTitle>
        </CardHeader>
        <CardContent>
          <LeaveHistoryTable leaveHistory={leaveHistory} isLoading={isLoading} />
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Yeni İzin Talebi Oluştur</DialogTitle>
          </DialogHeader>
          <LeaveRequestForm form={form} onSubmit={handleSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
