import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Phone, Mail } from "lucide-react";

const ActivitiesSummary = () => {
  // Mock data - bu gerçek verilerle değiştirilecek
  const activityStats = {
    meetings: 4,
    calls: 7,
    emails: 12,
    total: 23
  };

  return (
    <div className="space-y-4">
      {/* Total Activities */}
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-foreground">{activityStats.total}</span>
        <span className="text-sm text-muted-foreground">Toplam Aktivite</span>
      </div>

      {/* Activity Type Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-blue-500 mr-2" />
            <span className="text-sm text-muted-foreground">Toplantılar</span>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {activityStats.meetings}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Phone className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-sm text-muted-foreground">Aramalar</span>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            {activityStats.calls}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Mail className="h-4 w-4 text-purple-500 mr-2" />
            <span className="text-sm text-muted-foreground">E-postalar</span>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            {activityStats.emails}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-4 w-4 text-orange-500 mr-2" />
            <span className="text-sm text-muted-foreground">Müşteri Ziyaretleri</span>
          </div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            3
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="pt-3 border-t border-border">
        <div className="text-xs text-muted-foreground">
          Bugün: 5 aktivite planlandı
        </div>
      </div>
    </div>
  );
};

export default ActivitiesSummary;