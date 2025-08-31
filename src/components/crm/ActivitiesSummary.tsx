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
    <div className="space-y-4">
      {/* Main Metric */}
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-900 mb-1">{activityStats.total}</div>
        <div className="text-sm text-blue-700/70 font-medium">Toplam Aktivite</div>
      </div>
      
      {/* Mini Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-blue-200/30">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-800">Toplantı</span>
          </div>
          <div className="text-lg font-bold text-blue-900">{activityStats.meeting}</div>
        </div>
        
        <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-blue-200/30">
          <div className="flex items-center space-x-2 mb-2">
            <PenTool className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-medium text-blue-800">Analiz</span>
          </div>
          <div className="text-lg font-bold text-blue-900">{activityStats.analysis}</div>
        </div>
        
        <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-blue-200/30">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span className="text-xs font-medium text-blue-800">Yapılacak</span>
          </div>
          <div className="text-lg font-bold text-blue-900">{activityStats.todo}</div>
        </div>
        
        <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-blue-200/30">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs font-medium text-blue-800">Tamamlanan</span>
          </div>
          <div className="text-lg font-bold text-blue-900">{activityStats.completed}</div>
        </div>
      </div>
      
      {/* Progress Indicator */}
      <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-blue-200/30">
        <div className="flex justify-between items-center text-xs text-blue-800 mb-2">
          <span>Tamamlanma Oranı</span>
          <span className="font-bold">{activityStats.total > 0 ? Math.round((activityStats.completed / activityStats.total) * 100) : 0}%</span>
        </div>
        <div className="w-full bg-blue-200/50 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${activityStats.total > 0 ? (activityStats.completed / activityStats.total) * 100 : 0}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesSummary;