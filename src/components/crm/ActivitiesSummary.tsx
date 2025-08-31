import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Phone, Mail, FileText, TestTube, PenTool } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ActivityStats {
  total: number;
  meeting: number;
  analysis: number;
  planning: number;
  documentation: number;
  testing: number;
  general: number;
  todo: number;
  in_progress: number;
  completed: number;
}

const ActivitiesSummary = () => {
  const [activityStats, setActivityStats] = useState<ActivityStats>({
    total: 0,
    meeting: 0,
    analysis: 0,
    planning: 0,
    documentation: 0,
    testing: 0,
    general: 0,
    todo: 0,
    in_progress: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivityStats = async () => {
      try {
        setLoading(true);
        
        const { data: activities, error } = await supabase
          .from('activities')
          .select('type, status, priority');
          
        if (error) throw error;
        
        if (activities) {
          const stats: ActivityStats = {
            total: activities.length,
            meeting: 0,
            analysis: 0,
            planning: 0,
            documentation: 0,
            testing: 0,
            general: 0,
            todo: 0,
            in_progress: 0,
            completed: 0
          };
          
          activities.forEach(activity => {
            // Count by type
            if (stats.hasOwnProperty(activity.type)) {
              stats[activity.type as keyof ActivityStats]++;
            }
            
            // Count by status
            if (stats.hasOwnProperty(activity.status)) {
              stats[activity.status as keyof ActivityStats]++;
            }
          });
          
          setActivityStats(stats);
        }
      } catch (error) {
        console.error('Error fetching activity stats:', error);
        toast.error('Aktivite bilgileri yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivityStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3 py-6">
        <div className="h-6 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-20 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-6 bg-gray-200 animate-pulse rounded-md"></div>
      </div>
    );
  }

  if (activityStats.total === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground font-medium">Henüz aktivite bulunmuyor</p>
        <p className="text-sm mt-2 text-gray-500">Aktiviteler sayfasından yeni aktivite ekleyebilirsiniz</p>
      </div>
    );
  }

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
            {activityStats.meeting}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <PenTool className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-sm text-muted-foreground">Analiz</span>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            {activityStats.analysis}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-4 w-4 text-purple-500 mr-2" />
            <span className="text-sm text-muted-foreground">Dokümantasyon</span>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            {activityStats.documentation}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-4 w-4 text-orange-500 mr-2" />
            <span className="text-sm text-muted-foreground">Planlama</span>
          </div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            {activityStats.planning}
          </Badge>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="pt-3 border-t border-border">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-semibold text-orange-600">{activityStats.todo}</div>
            <div className="text-muted-foreground">Yapılacak</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">{activityStats.in_progress}</div>
            <div className="text-muted-foreground">Devam Ediyor</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-600">{activityStats.completed}</div>
            <div className="text-muted-foreground">Tamamlandı</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesSummary;