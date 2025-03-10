
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Star, TrendingUp, Target } from "lucide-react";
import { useForm } from "react-hook-form";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface EmployeePerformanceTabProps {
  employeeId: string;
}

interface PerformanceRecord {
  id: string;
  employee_id: string;
  review_period: string;
  reviewer_id: string | null;
  reviewer_name: string | null;
  technical_score: number;
  communication_score: number;
  teamwork_score: number;
  leadership_score: number;
  overall_score: number;
  strengths: string | null;
  areas_for_improvement: string | null;
  goals: string | null;
  notes: string | null;
  created_at: string;
}

export const EmployeePerformanceTab = ({ employeeId }: EmployeePerformanceTabProps) => {
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      review_period: new Date().toLocaleDateString('en-CA').substring(0, 7), // YYYY-MM format
      technical_score: 3,
      communication_score: 3,
      teamwork_score: 3,
      leadership_score: 3,
      strengths: '',
      areas_for_improvement: '',
      goals: '',
      notes: '',
    }
  });

  useEffect(() => {
    const fetchPerformanceHistory = async () => {
      try {
        setIsLoading(true);
        // This is a placeholder until the actual performance table is created
        // Using mock data for now
        const mockData: PerformanceRecord[] = [
          {
            id: '1',
            employee_id: employeeId,
            review_period: '2023-01',
            reviewer_id: '123',
            reviewer_name: 'John Manager',
            technical_score: 4,
            communication_score: 3,
            teamwork_score: 4,
            leadership_score: 3,
            overall_score: 3.5,
            strengths: 'Technical expertise, problem-solving',
            areas_for_improvement: 'Communication with team members',
            goals: 'Improve project documentation',
            notes: 'Overall good performance',
            created_at: '2023-01-31T00:00:00Z'
          },
          {
            id: '2',
            employee_id: employeeId,
            review_period: '2023-04',
            reviewer_id: '123',
            reviewer_name: 'John Manager',
            technical_score: 4,
            communication_score: 4,
            teamwork_score: 4,
            leadership_score: 3,
            overall_score: 3.75,
            strengths: 'Technical expertise, problem-solving, improved communication',
            areas_for_improvement: 'Taking initiative on projects',
            goals: 'Lead at least one project in next quarter',
            notes: 'Showing improvement in communication',
            created_at: '2023-04-30T00:00:00Z'
          },
          {
            id: '3',
            employee_id: employeeId,
            review_period: '2023-07',
            reviewer_id: '123',
            reviewer_name: 'John Manager',
            technical_score: 5,
            communication_score: 4,
            teamwork_score: 4,
            leadership_score: 4,
            overall_score: 4.25,
            strengths: 'Technical expertise, mentoring junior team members',
            areas_for_improvement: 'Time management during project deadlines',
            goals: 'Complete leadership training program',
            notes: 'Excellent technical performance',
            created_at: '2023-07-31T00:00:00Z'
          },
        ];
        
        setPerformanceHistory(mockData);
      } catch (error) {
        console.error('Error fetching performance history:', error);
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Performans bilgileri yüklenirken bir hata oluştu.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformanceHistory();
  }, [employeeId, toast]);

  const handleSubmit = async (values: any) => {
    try {
      // Calculate overall score
      const overall = (
        parseFloat(values.technical_score) + 
        parseFloat(values.communication_score) + 
        parseFloat(values.teamwork_score) + 
        parseFloat(values.leadership_score)
      ) / 4;
      
      // This is a placeholder until the actual performance table is created
      console.log('Submitted performance data:', { 
        ...values, 
        employee_id: employeeId,
        overall_score: overall,
        reviewer_name: 'Current User', // This would be the logged-in user in a real app
      });
      
      toast({
        title: "Başarılı",
        description: "Performans değerlendirmesi kaydedildi.",
      });
      setIsFormOpen(false);
      
      // Add the new record to the state (simulating DB update)
      const newRecord: PerformanceRecord = {
        id: Date.now().toString(),
        employee_id: employeeId,
        review_period: values.review_period,
        reviewer_id: 'current-user',
        reviewer_name: 'Current User',
        technical_score: parseFloat(values.technical_score),
        communication_score: parseFloat(values.communication_score),
        teamwork_score: parseFloat(values.teamwork_score),
        leadership_score: parseFloat(values.leadership_score),
        overall_score: overall,
        strengths: values.strengths,
        areas_for_improvement: values.areas_for_improvement,
        goals: values.goals,
        notes: values.notes,
        created_at: new Date().toISOString()
      };
      
      setPerformanceHistory([...performanceHistory, newRecord]);
    } catch (error) {
      console.error('Error saving performance data:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Performans değerlendirmesi kaydedilirken bir hata oluştu.",
      });
    }
  };

  const getChartData = () => {
    return performanceHistory.map(record => ({
      period: record.review_period,
      Technical: record.technical_score,
      Communication: record.communication_score,
      Teamwork: record.teamwork_score,
      Leadership: record.leadership_score,
      Overall: record.overall_score
    }));
  };

  const getLatestScores = () => {
    if (performanceHistory.length === 0) return null;
    return performanceHistory[performanceHistory.length - 1];
  };

  const getPerformanceTrend = () => {
    if (performanceHistory.length < 2) return { trend: 0, icon: null };
    
    const latest = performanceHistory[performanceHistory.length - 1].overall_score;
    const previous = performanceHistory[performanceHistory.length - 2].overall_score;
    const trend = ((latest - previous) / previous) * 100;
    
    return { 
      trend: parseFloat(trend.toFixed(1)),
      icon: trend >= 0 ? <TrendingUp className="h-3 w-3 text-green-500" /> : <TrendingUp className="h-3 w-3 text-red-500 transform rotate-180" />
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Performans Değerlendirmesi</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Yeni Değerlendirme
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Yeni Performans Değerlendirmesi</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="review_period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Değerlendirme Dönemi</FormLabel>
                    <FormControl>
                      <Input type="month" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="technical_score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teknik Performans (1-5)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="5" step="0.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="communication_score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İletişim (1-5)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="5" step="0.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="teamwork_score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Takım Çalışması (1-5)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="5" step="0.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="leadership_score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Liderlik (1-5)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="5" step="0.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="strengths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Güçlü Yönleri</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="areas_for_improvement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Geliştirilmesi Gereken Alanlar</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hedefler</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ek Notlar</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit">Değerlendirmeyi Kaydet</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Genel Performans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {getLatestScores()?.overall_score.toFixed(1) || "N/A"}
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.round(getLatestScores()?.overall_score || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>
            {getPerformanceTrend().trend !== 0 && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                {getPerformanceTrend().icon}
                {getPerformanceTrend().trend > 0 ? '+' : ''}{getPerformanceTrend().trend}% son değerlendirmeden
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Teknik Beceriler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getLatestScores()?.technical_score.toFixed(1) || "N/A"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">İletişim</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getLatestScores()?.communication_score.toFixed(1) || "N/A"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Takım Çalışması</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getLatestScores()?.teamwork_score.toFixed(1) || "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Performans Trendi</CardTitle>
        </CardHeader>
        <CardContent>
          {performanceHistory.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData()} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="Technical" fill="#8884d8" name="Teknik" />
                  <Bar dataKey="Communication" fill="#82ca9d" name="İletişim" />
                  <Bar dataKey="Teamwork" fill="#ffc658" name="Takım Çalışması" />
                  <Bar dataKey="Leadership" fill="#ff8042" name="Liderlik" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              Henüz performans değerlendirmesi yapılmamış
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performans Değerlendirme Geçmişi</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Yükleniyor...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dönem</TableHead>
                  <TableHead>Teknik</TableHead>
                  <TableHead>İletişim</TableHead>
                  <TableHead>Takım Çalışması</TableHead>
                  <TableHead>Liderlik</TableHead>
                  <TableHead>Genel</TableHead>
                  <TableHead>Değerlendiren</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performanceHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Henüz performans değerlendirmesi yapılmamış.
                    </TableCell>
                  </TableRow>
                ) : (
                  performanceHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {record.review_period.substring(0, 4)}/{record.review_period.substring(5, 7)}
                      </TableCell>
                      <TableCell>{record.technical_score}</TableCell>
                      <TableCell>{record.communication_score}</TableCell>
                      <TableCell>{record.teamwork_score}</TableCell>
                      <TableCell>{record.leadership_score}</TableCell>
                      <TableCell>{record.overall_score.toFixed(1)}</TableCell>
                      <TableCell>{record.reviewer_name}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {getLatestScores() && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                Güçlü Yönleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{getLatestScores()?.strengths || "Belirtilmemiş"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                Geliştirilmesi Gereken Alanlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{getLatestScores()?.areas_for_improvement || "Belirtilmemiş"}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
