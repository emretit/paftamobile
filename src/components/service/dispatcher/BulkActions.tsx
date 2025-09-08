import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Pause,
  Calendar,
  UserPlus,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { ServiceRequest } from '@/hooks/useServiceRequests';

interface BulkActionsProps {
  selectedServices: string[];
  onSelectAll: (selectAll: boolean) => void;
  onBulkAssign: (technicianId: string) => void;
  onBulkStatusChange: (status: string) => void;
  onBulkDelete: () => void;
  technicians: any[];
  totalServices: number;
  onClearSelection: () => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedServices,
  onSelectAll,
  onBulkAssign,
  onBulkStatusChange,
  onBulkDelete,
  technicians,
  totalServices,
  onClearSelection
}) => {
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const isAllSelected = selectedServices.length === totalServices && totalServices > 0;
  const isPartiallySelected = selectedServices.length > 0 && selectedServices.length < totalServices;

  const statusOptions = [
    { value: 'assigned', label: 'Atanmış', icon: CheckCircle, color: 'text-blue-600' },
    { value: 'in_progress', label: 'Devam Ediyor', icon: Clock, color: 'text-purple-600' },
    { value: 'completed', label: 'Tamamlandı', icon: CheckCircle, color: 'text-green-600' },
    { value: 'cancelled', label: 'İptal Edildi', icon: XCircle, color: 'text-red-600' },
    { value: 'on_hold', label: 'Beklemede', icon: Pause, color: 'text-yellow-600' }
  ];

  const handleSelectAll = () => {
    onSelectAll(!isAllSelected);
  };

  const handleBulkAssign = () => {
    if (selectedTechnician) {
      onBulkAssign(selectedTechnician);
      setSelectedTechnician('');
    }
  };

  const handleBulkStatusChange = () => {
    if (selectedStatus) {
      onBulkStatusChange(selectedStatus);
      setSelectedStatus('');
    }
  };

  if (selectedServices.length === 0) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isAllSelected}
              ref={(el) => {
                if (el) el.indeterminate = isPartiallySelected;
              }}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium text-gray-700">
              {isAllSelected ? 'Tümünü Kaldır' : 'Tümünü Seç'} ({totalServices} servis)
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Toplu işlem yapmak için servisleri seçin
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-blue-50 border-blue-200">
      <div className="space-y-4">
        {/* Selection Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isAllSelected}
              ref={(el) => {
                if (el) el.indeterminate = isPartiallySelected;
              }}
              onCheckedChange={handleSelectAll}
            />
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {selectedServices.length} servis seçildi
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Seçimi Temizle
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Teknisyen Atama */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <UserPlus className="h-4 w-4" />
              Teknisyen Ata
            </label>
            <div className="flex gap-2">
              <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Teknisyen seçin" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name} {tech.surname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleBulkAssign}
                disabled={!selectedTechnician}
                size="sm"
                className="px-3"
              >
                Ata
              </Button>
            </div>
          </div>

          {/* Durum Değiştirme */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Durum Değiştir
            </label>
            <div className="flex gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className={`h-4 w-4 ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleBulkStatusChange}
                disabled={!selectedStatus}
                size="sm"
                className="px-3"
              >
                Değiştir
              </Button>
            </div>
          </div>

          {/* Diğer İşlemler */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <MoreHorizontal className="h-4 w-4" />
              Diğer İşlemler
            </label>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={onBulkDelete}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Sil
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-blue-200">
          <span className="text-sm font-medium text-gray-700 mr-2">Hızlı İşlemler:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedStatus('assigned');
              handleBulkStatusChange();
            }}
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Atanmış Yap
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedStatus('in_progress');
              handleBulkStatusChange();
            }}
            className="text-purple-600 border-purple-300 hover:bg-purple-50"
          >
            <Clock className="h-4 w-4 mr-1" />
            Devam Ediyor Yap
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedStatus('completed');
              handleBulkStatusChange();
            }}
            className="text-green-600 border-green-300 hover:bg-green-50"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Tamamlandı Yap
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedStatus('cancelled');
              handleBulkStatusChange();
            }}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4 mr-1" />
            İptal Et
          </Button>
        </div>
      </div>
    </Card>
  );
};
