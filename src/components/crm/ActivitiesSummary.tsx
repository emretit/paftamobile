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
      <div className="space-y-4 py-6">
        <div className="h-8 bg-gradient-to-r from-blue-100 to-blue-50 animate-pulse rounded-lg"></div>
        <div className="space-y-3">
          <div className="h-6 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-md"></div>
          <div className="h-4 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-md"></div>
          <div className="h-6 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-md"></div>
          <div className="h-4 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-md"></div>
        </div>
      </div>
    );
  }

  if (activityStats.total === 0) {
    return (
      <div className="text-center py-8 bg-gradient-to-br from-blue-50/30 to-blue-100/20 rounded-lg border border-blue-200/30">
        <Calendar className="h-12 w-12 text-blue-400 mx-auto mb-3" />
        <p className="text-muted-foreground font-medium">Henüz aktivite bulunmuyor</p>
        <p className="text-sm mt-2 text-blue-600/70">İlk aktivitenizi oluşturun</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100/50 p-4 rounded-lg border border-blue-200/50 shadow-sm">
        <span className="text-2xl font-bold text-blue-800">{activityStats.total}</span>
        <span className="text-sm font-medium text-blue-600">Toplam Aktivite</span>
      </div>
      
      <div className="space-y-5">
        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Türe Göre
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50/50 to-blue-100/30 rounded-lg border border-blue-200/30 hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Toplantı</span>
              </div>
              <span className="text-sm font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-full shadow-sm">
                {activityStats.meeting}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 rounded-lg border border-emerald-200/30 hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                  <PenTool className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-sm font-medium">Analiz</span>
              </div>
              <span className="text-sm font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1.5 rounded-full shadow-sm">
                {activityStats.analysis}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground flex items-center">
            <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
            Duruma Göre
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2.5 bg-gradient-to-r from-amber-50/50 to-amber-100/30 rounded-lg border border-amber-200/30">
              <span className="text-sm font-medium">Yapılacak</span>
              <span className="text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-full">
                {activityStats.todo}
              </span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-gradient-to-r from-blue-50/50 to-blue-100/30 rounded-lg border border-blue-200/30">
              <span className="text-sm font-medium">Devam Eden</span>
              <span className="text-sm font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full">
                {activityStats.in_progress}
              </span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-gradient-to-r from-green-50/50 to-green-100/30 rounded-lg border border-green-200/30">
              <span className="text-sm font-medium">Tamamlanan</span>
              <span className="text-sm font-bold bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full">
                {activityStats.completed}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesSummary;