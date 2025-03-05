
import React from "react";

interface RequestDescriptionProps {
  description?: string;
}

export const RequestDescription: React.FC<RequestDescriptionProps> = ({ description }) => {
  if (!description) return null;
  
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Açıklama</h3>
      <p className="text-muted-foreground whitespace-pre-line">{description}</p>
    </div>
  );
};
