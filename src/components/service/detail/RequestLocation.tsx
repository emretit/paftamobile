
import React from "react";

interface RequestLocationProps {
  location?: string;
}

export const RequestLocation: React.FC<RequestLocationProps> = ({ location }) => {
  if (!location) return null;
  
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Konum</h3>
      <p className="text-muted-foreground">{location}</p>
    </div>
  );
};
