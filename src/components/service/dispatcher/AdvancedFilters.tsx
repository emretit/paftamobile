import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, Search, X, Calendar as CalendarIcon, User, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface AdvancedFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  technicianFilter: string;
  setTechnicianFilter: (technician: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  dateRange: { from: Date | undefined; to: Date | undefined };
  setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  locationFilter: string;
  setLocationFilter: (location: string) => void;
  technicians: any[];
  onClearFilters: () => void;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  technicianFilter,
  setTechnicianFilter,
  priorityFilter,
  setPriorityFilter,
  dateRange,
  setDateRange,
  locationFilter,
  setLocationFilter,
  technicians,
  onClearFilters
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'Tüm Durumlar' },
    { value: 'new', label: 'Yeni' },
    { value: 'assigned', label: 'Atanmış' },
    { value: 'in_progress', label: 'Devam Ediyor' },
    { value: 'completed', label: 'Tamamlandı' },
    { value: 'cancelled', label: 'İptal Edildi' },
    { value: 'on_hold', label: 'Beklemede' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'Tüm Öncelikler' },
    { value: 'urgent', label: 'Acil' },
    { value: 'high', label: 'Yüksek' },
    { value: 'medium', label: 'Orta' },
    { value: 'low', label: 'Düşük' }
  ];

  const activeFiltersCount = [
    searchQuery,
    statusFilter !== 'all',
    technicianFilter !== 'all',
    priorityFilter !== 'all',
    dateRange.from || dateRange.to,
    locationFilter
  ].filter(Boolean).length;

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Gelişmiş Filtreler</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} aktif
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-1" />
                Temizle
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Gizle' : 'Göster'}
            </Button>
          </div>
        </div>

        {/* Basic Filters - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Arama */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium flex items-center gap-1">
              <Search className="h-4 w-4" />
              Arama
            </Label>
            <Input
              id="search"
              placeholder="Görev başlığı, müşteri..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Durum Filtresi */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Durum</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Teknisyen Filtresi */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              <User className="h-4 w-4" />
              Teknisyen
            </Label>
            <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Teknisyen seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Teknisyenler</SelectItem>
                <SelectItem value="unassigned">Atanmamış</SelectItem>
                {technicians?.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.first_name} {tech.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Öncelik Filtresi */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Öncelik</Label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Öncelik seçin" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters - Expandable */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            {/* Tarih Aralığı */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                Tarih Aralığı
              </Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? format(dateRange.from, 'dd.MM.yyyy') : 'Başlangıç'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? format(dateRange.to, 'dd.MM.yyyy') : 'Bitiş'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Konum Filtresi */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Konum
              </Label>
              <Input
                placeholder="Şehir, bölge..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Hızlı Filtreler */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Hızlı Filtreler
              </Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={dateRange.from?.toDateString() === new Date().toDateString() ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateRange({ from: new Date(), to: undefined })}
                >
                  Bugün
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setDateRange({ from: tomorrow, to: undefined });
                  }}
                >
                  Yarın
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const startOfWeek = new Date();
                    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(endOfWeek.getDate() + 6);
                    setDateRange({ from: startOfWeek, to: endOfWeek });
                  }}
                >
                  Bu Hafta
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-600">Aktif Filtreler:</span>
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Arama: {searchQuery}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSearchQuery('')}
                  />
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Durum: {statusOptions.find(s => s.value === statusFilter)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setStatusFilter('all')}
                  />
                </Badge>
              )}
              {technicianFilter !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Teknisyen: {technicianFilter === 'unassigned' ? 'Atanmamış' : technicians.find(t => t.id === technicianFilter)?.name}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setTechnicianFilter('all')}
                  />
                </Badge>
              )}
              {priorityFilter !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Öncelik: {priorityOptions.find(p => p.value === priorityFilter)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setPriorityFilter('all')}
                  />
                </Badge>
              )}
              {(dateRange.from || dateRange.to) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Tarih: {dateRange.from ? format(dateRange.from, 'dd.MM') : '...'} - {dateRange.to ? format(dateRange.to, 'dd.MM') : '...'}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setDateRange({ from: undefined, to: undefined })}
                  />
                </Badge>
              )}
              {locationFilter && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Konum: {locationFilter}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setLocationFilter('')}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
