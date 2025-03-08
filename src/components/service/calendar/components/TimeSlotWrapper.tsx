
import React from "react";

interface TimeSlotWrapperProps {
  children: React.ReactNode;
}

export const TimeSlotWrapper = ({ children }: TimeSlotWrapperProps) => {
  return (
    <div className="h-full w-full bg-gray-50/30 hover:bg-blue-50/30 transition-colors">
      {children}
    </div>
  );
};
