import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import { useServiceRequests, ServiceRequest } from "@/hooks/useServiceRequests";
import { ServiceRequestDetail } from "@/components/service/ServiceRequestDetail";
import { ServiceRequestForm } from "@/components/service/ServiceRequestForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Filter, User, Clock, MapPin, Users, CheckCircle, XCircle, Eye, CalendarDays, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import moment from 'moment';
import 'moment/locale/tr';
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

moment.locale('tr');

interface ServiceListPageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ServiceListPage = ({ isCollapsed, setIsCollapsed }: ServiceListPageProps) => {
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<"title" | "priority" | "created_at">("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data: serviceRequests, isLoading, error } = useServiceRequests();

  // Teknisyenleri getir
  const { data: technicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('department', 'Teknik')
        .eq('status', 'aktif');
      
      if (error) throw error;
      return data;
    },
  });

  const handleSelectRequest = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };

  // Öncelik renklerini belirle
  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: '#ef4444',
      high: '#f97316',
      medium: '#eab308', 
      low: '#22c55e',
    };
    return colors[priority as keyof typeof colors] || '#6b7280';
  };

  // Filtrelenmiş servisleri hesapla
  const filteredServices = serviceRequests?.filter(request => {
    const matchesSearch = !searchQuery || 
      request.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  }) || [];

  // Sıralama mantığı
  const allSortedServices = filteredServices.sort((a, b) => {
    let valueA, valueB;
    
    if (sortField === "title") {
      valueA = (a.title || '').toLowerCase();
      valueB = (b.title || '').toLowerCase();
    } else if (sortField === "priority") {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      valueA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      valueB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
    } else { // created_at
      valueA = new Date(a.created_at || 0).getTime();
      valueB = new Date(b.created_at || 0).getTime();
    }
    
    if (sortDirection === "asc") {
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    } else {
      return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil((allSortedServices?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const sortedServices = allSortedServices?.slice(startIndex, endIndex);

  const handleSort = (field: "title" | "priority" | "created_at") => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "created_at" ? "desc" : "asc");
    }
  };

  // Atanmamış ve atanmış servisleri ayır
  const unassignedServices = sortedServices?.filter(request => !request.assigned_technician_id) || [];
  const assignedServices = sortedServices?.filter(request => request.assigned_technician_id) || [];

  // İstatistikleri hesapla
  const stats = {
    total: serviceRequests?.length || 0,
    unassigned: unassignedServices.length,
    assigned: assignedServices.length,
    urgent: filteredServices.filter(r => r.priority === 'urgent').length,
    high: filteredServices.filter(r => r.priority === 'high').length,
    medium: filteredServices.filter(r => r.priority === 'medium').length,
    low: filteredServices.filter(r => r.priority === 'low').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex relative">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <TopBar />
        <div className="p-4 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Servis Talepleri
              </h1>
              <p className="text-sm text-muted-foreground/80">
                Servis taleplerinizi liste halinde görüntüleyin ve yönetin
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => navigate("/service")}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                Takvim Görünümü
              </Button>
              <Button 
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg transition-all duration-300"
                onClick={() => setIsNewRequestOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Yeni Servis Talebi
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="p-4 bg-white border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Atanmamış</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.unassigned}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <XCircle className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Atanmış</p>
                  <p className="text-2xl font-bold text-green-600">{stats.assigned}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Acil</p>
                  <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Yüksek</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <XCircle className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Orta/Düşük</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.medium + stats.low}</p>
                </div>
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 p-6 bg-gradient-to-r from-card/80 to-muted/40 rounded-xl border border-border/30 shadow-lg backdrop-blur-sm">
            <div className="relative w-[400px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Servis adı, lokasyon veya açıklama ile ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="new">Yeni</SelectItem>
                <SelectItem value="assigned">Atanmış</SelectItem>
                <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
                <SelectItem value="cancelled">İptal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Öncelik" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Öncelikler</SelectItem>
                <SelectItem value="urgent">Acil</SelectItem>
                <SelectItem value="high">Yüksek</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="low">Düşük</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Service List Table */}
          <div className="bg-gradient-to-br from-card via-muted/20 to-background rounded-2xl shadow-2xl border border-border/10 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-50"></div>
            <div className="relative z-10 p-6">
              <div className="overflow-x-auto">
                <Table className="border-collapse">
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b">
                      <TableHead 
                        className={cn(
                          "h-12 px-4 text-left align-middle font-bold text-foreground/80 whitespace-nowrap text-sm tracking-wide cursor-pointer hover:bg-muted/50"
                        )}
                        onClick={() => handleSort("title")}
                      >
                        <div className="flex items-center">
                          <span>🔧 Servis Adı</span>
                          {sortField === "title" && (
                            sortDirection === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="h-12 px-4 text-left align-middle font-bold text-foreground/80 whitespace-nowrap text-sm tracking-wide">
                        📍 Lokasyon
                      </TableHead>
                      <TableHead 
                        className={cn(
                          "h-12 px-4 text-left align-middle font-bold text-foreground/80 whitespace-nowrap text-sm tracking-wide cursor-pointer hover:bg-muted/50"
                        )}
                        onClick={() => handleSort("priority")}
                      >
                        <div className="flex items-center">
                          <span>⚡ Öncelik</span>
                          {sortField === "priority" && (
                            sortDirection === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="h-12 px-4 text-left align-middle font-bold text-foreground/80 whitespace-nowrap text-sm tracking-wide">
                        📊 Durum
                      </TableHead>
                      <TableHead className="h-12 px-4 text-left align-middle font-bold text-foreground/80 whitespace-nowrap text-sm tracking-wide">
                        👤 Teknisyen
                      </TableHead>
                      <TableHead 
                        className={cn(
                          "h-12 px-4 text-left align-middle font-bold text-foreground/80 whitespace-nowrap text-sm tracking-wide cursor-pointer hover:bg-muted/50"
                        )}
                        onClick={() => handleSort("created_at")}
                      >
                        <div className="flex items-center">
                          <span>📅 Tarih</span>
                          {sortField === "created_at" && (
                            sortDirection === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="h-12 px-4 text-right align-middle font-bold text-foreground/80 whitespace-nowrap text-sm tracking-wide">
                        ⚙️ İşlemler
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Yükleniyor...
                        </TableCell>
                      </TableRow>
                    ) : sortedServices?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Servis talebi bulunamadı
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedServices?.map((service) => {
                        const technician = technicians?.find(tech => tech.id === service.assigned_technician_id);
                        return (
                          <TableRow 
                            key={service.id} 
                            className="hover:bg-muted/50 cursor-pointer"
                            onClick={() => handleSelectRequest(service)}
                          >
                            <TableCell className="px-4 py-4">
                              <div className="font-medium text-foreground">{service.title}</div>
                              {service.description && (
                                <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {service.description}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                {service.location || 'Belirtilmemiş'}
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                                style={{ 
                                  backgroundColor: getPriorityColor(service.priority || 'medium') + '20',
                                  borderColor: getPriorityColor(service.priority || 'medium'),
                                  color: getPriorityColor(service.priority || 'medium')
                                }}
                              >
                                {service.priority === 'urgent' ? 'Acil' : 
                                 service.priority === 'high' ? 'Yüksek' :
                                 service.priority === 'medium' ? 'Orta' : 'Düşük'}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                                style={{
                                  backgroundColor: service.status === 'completed' ? '#22c55e20' : 
                                                 service.status === 'in_progress' ? '#3b82f620' :
                                                 service.status === 'assigned' ? '#8b5cf620' : '#6b728020',
                                  borderColor: service.status === 'completed' ? '#22c55e' : 
                                             service.status === 'in_progress' ? '#3b82f6' :
                                             service.status === 'assigned' ? '#8b5cf6' : '#6b7280',
                                  color: service.status === 'completed' ? '#22c55e' : 
                                        service.status === 'in_progress' ? '#3b82f6' :
                                        service.status === 'assigned' ? '#8b5cf6' : '#6b7280'
                                }}
                              >
                                {service.status === 'new' ? 'Yeni' :
                                 service.status === 'assigned' ? 'Atanmış' :
                                 service.status === 'in_progress' ? 'Devam Ediyor' :
                                 service.status === 'completed' ? 'Tamamlandı' : 'Bilinmeyen'}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <User className="h-4 w-4" />
                                {technician ? `${technician.first_name} ${technician.last_name}` : 
                                 service.assigned_technician_id ? 'Bilinmeyen Teknisyen' : 'Atanmamış'}
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {service.scheduled_date ? 
                                  moment(service.scheduled_date).format('DD MMM YYYY, HH:mm') : 
                                  'Tarih belirtilmemiş'
                                }
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {!service.assigned_technician_id ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // TODO: Teknisyen seçme modalı aç
                                      console.log('Teknisyen seç:', service.title);
                                    }}
                                  >
                                    <Users className="h-4 w-4 mr-1" />
                                    Ata
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectRequest(service);
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Detay
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-card rounded-lg border">
              <div className="text-sm text-muted-foreground">
                Toplam <span className="font-medium text-foreground">{allSortedServices?.length || 0}</span> servis talebi, 
                <span className="font-medium text-foreground"> {startIndex + 1}-{Math.min(endIndex, allSortedServices?.length || 0)}</span> arası gösteriliyor
              </div>
              <Pagination>
                <PaginationContent className="gap-1">
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "hover:bg-accent"}
                    />
                  </PaginationItem>
                  
                  {/* Smart pagination with ellipsis */}
                  {(() => {
                    const pages = [];
                    const showPages = 5;
                    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
                    const endPage = Math.min(totalPages, startPage + showPages - 1);
                    
                    if (endPage - startPage < showPages - 1) {
                      startPage = Math.max(1, endPage - showPages + 1);
                    }
                    
                    if (startPage > 1) {
                      pages.push(
                        <PaginationItem key={1}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(1);
                            }}
                            className="hover:bg-accent"
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                      );
                      if (startPage > 2) {
                        pages.push(
                          <PaginationItem key="start-ellipsis">
                            <span className="px-3 py-2 text-muted-foreground">...</span>
                          </PaginationItem>
                        );
                      }
                    }
                    
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <PaginationItem key={i}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(i);
                            }}
                            isActive={currentPage === i}
                            className={currentPage === i ? "bg-primary text-primary-foreground" : "hover:bg-accent"}
                          >
                            {i}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <PaginationItem key="end-ellipsis">
                            <span className="px-3 py-2 text-muted-foreground">...</span>
                          </PaginationItem>
                        );
                      }
                      pages.push(
                        <PaginationItem key={totalPages}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(totalPages);
                            }}
                            className="hover:bg-accent"
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    
                    return pages;
                  })()}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "hover:bg-accent"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>

        {/* Service Request Detail Dialog */}
        <ServiceRequestDetail 
          serviceRequest={selectedRequest}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedRequest(null);
          }}
        />

        {/* New Service Request Dialog */}
        <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Yeni Servis Talebi
              </DialogTitle>
            </DialogHeader>
            <ServiceRequestForm 
              onClose={() => setIsNewRequestOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ServiceListPage;
