
import { ProposalStatus } from "@/types/proposal";
import { statusStyles, statusLabels } from "../constants";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";

// These should match the workflow steps in the image
const workflowSteps: { status: ProposalStatus; label: string }[] = [
  { status: "discovery_scheduled", label: "Planlandı" },
  { status: "meeting_completed", label: "Keşif Tamamlandı" },
  { status: "quote_in_progress", label: "Hazırlanıyor" },
  { status: "sent", label: "Gönderildi" },
  { status: "negotiation", label: "Müzakerede" }
];

interface ProposalWorkflowProgressProps {
  currentStatus: ProposalStatus;
  onStatusChange: (status: ProposalStatus) => void;
  isUpdating?: boolean;
}

export const ProposalWorkflowProgress = ({ 
  currentStatus, 
  onStatusChange,
  isUpdating = false
}: ProposalWorkflowProgressProps) => {
  const currentStepIndex = workflowSteps.findIndex(step => step.status === currentStatus);
  
  // Calculate progress percentage
  const progressPercentage = currentStepIndex >= 0 
    ? ((currentStepIndex + 1) / workflowSteps.length) * 100 
    : 0;
  
  // Determine next step
  const nextStep = currentStepIndex >= 0 && currentStepIndex < workflowSteps.length - 1 
    ? workflowSteps[currentStepIndex + 1] 
    : null;
  
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Teklif Durumu</h3>
        
        {/* Progress bar */}
        <Progress 
          value={progressPercentage} 
          className="h-2 w-full bg-gray-100" 
          indicatorClassName="bg-blue-500"
        />
        
        {/* Steps */}
        <div className="flex justify-between relative mt-4">
          {workflowSteps.map((step, index) => {
            const isActive = currentStepIndex >= index;
            const isCurrent = currentStepIndex === index;
            
            return (
              <div 
                key={step.status} 
                className="flex flex-col items-center cursor-pointer"
                onClick={() => !isUpdating && onStatusChange(step.status)}
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors
                    ${isCurrent 
                      ? 'bg-blue-500 text-white ring-4 ring-blue-100' 
                      : isActive 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-400'}`}
                >
                  <span className="text-sm font-medium">{index + 1}</span>
                </div>
                <span 
                  className={`text-xs mt-2 font-medium 
                    ${isCurrent 
                      ? 'text-blue-500' 
                      : isActive 
                        ? 'text-gray-800' 
                        : 'text-gray-400'}`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Next Action Section */}
      {nextStep && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Sonraki Adım</h3>
          <div 
            className="flex justify-between items-center p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => !isUpdating && onStatusChange(nextStep.status)}
          >
            <div className="flex items-center">
              <ArrowRight className="h-5 w-5 text-blue-500 mr-2" />
              <div>
                <p className="font-medium text-blue-700">{nextStep.label}</p>
                <p className="text-sm text-blue-600">Süreci bir sonraki aşamaya taşı</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-blue-500" />
          </div>
        </div>
      )}
      
      {/* Final Status Section */}
      {currentStatus === "negotiation" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Sonuç Belirle</h3>
          <div 
            className="p-4 border border-green-200 rounded-lg cursor-pointer hover:bg-green-50 transition-colors"
            onClick={() => !isUpdating && onStatusChange("approved")}
          >
            <div className="flex items-center">
              <div className="mr-2 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div>
                <p className="font-medium text-green-800">Onaylandı</p>
                <p className="text-sm text-green-600">Müşteri teklifi kabul etti</p>
              </div>
            </div>
          </div>
          
          <div 
            className="p-4 border border-red-200 rounded-lg cursor-pointer hover:bg-red-50 transition-colors"
            onClick={() => !isUpdating && onStatusChange("rejected")}
          >
            <div className="flex items-center">
              <div className="mr-2 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <div>
                <p className="font-medium text-red-800">Reddedildi</p>
                <p className="text-sm text-red-600">Müşteri teklifi kabul etmedi</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
