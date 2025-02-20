
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventModalData, EVENT_CATEGORIES } from '@/types/calendar';

interface EventModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  modalData: EventModalData;
  setModalData: (data: EventModalData) => void;
  onSave: () => void;
  onDelete: () => void;
}

const EventModal = ({
  isOpen,
  onOpenChange,
  modalData,
  setModalData,
  onSave,
  onDelete
}: EventModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1A1F2C] text-white border-red-900/20">
        <DialogHeader>
          <DialogTitle>{modalData.id ? 'Etkinliği Düzenle' : 'Yeni Etkinlik'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Başlık</Label>
            <Input
              id="title"
              value={modalData.title}
              onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
              className="bg-red-950/10 border-red-900/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start">Başlangıç</Label>
              <Input
                id="start"
                type="datetime-local"
                value={modalData.start}
                onChange={(e) => setModalData({ ...modalData, start: e.target.value })}
                className="bg-red-950/10 border-red-900/20"
              />
            </div>
            <div>
              <Label htmlFor="end">Bitiş</Label>
              <Input
                id="end"
                type="datetime-local"
                value={modalData.end}
                onChange={(e) => setModalData({ ...modalData, end: e.target.value })}
                className="bg-red-950/10 border-red-900/20"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Açıklama</Label>
            <Input
              id="description"
              value={modalData.description}
              onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
              className="bg-red-950/10 border-red-900/20"
            />
          </div>

          <div>
            <Label htmlFor="event_type">Etkinlik Tipi</Label>
            <Select
              value={modalData.event_type}
              onValueChange={(value: 'technical' | 'sales') => 
                setModalData({ ...modalData, event_type: value })}
            >
              <SelectTrigger className="bg-red-950/10 border-red-900/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Teknik</SelectItem>
                <SelectItem value="sales">Satış</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {modalData.event_type === 'technical' && (
            <div>
              <Label htmlFor="category">Teknik İşlem Tipi</Label>
              <Select
                value={modalData.category}
                onValueChange={(value: string) => 
                  setModalData({ ...modalData, category: value })}
              >
                <SelectTrigger className="bg-red-950/10 border-red-900/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_CATEGORIES.technical.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'installation' ? 'Kurulum' :
                       category === 'maintenance' ? 'Bakım' :
                       category === 'repair' ? 'Onarım' :
                       category === 'inspection' ? 'Kontrol' : 'Acil Müdahale'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="status">Durum</Label>
            <Select
              value={modalData.status}
              onValueChange={(value: 'scheduled' | 'completed' | 'canceled') => 
                setModalData({ ...modalData, status: value })}
            >
              <SelectTrigger className="bg-red-950/10 border-red-900/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Planlandı</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
                <SelectItem value="canceled">İptal Edildi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          {modalData.id && (
            <Button
              variant="destructive"
              onClick={onDelete}
              className="bg-red-700 hover:bg-red-800"
            >
              Sil
            </Button>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-red-900/20 text-white hover:bg-red-900/20"
            >
              İptal
            </Button>
            <Button
              onClick={onSave}
              className="bg-red-900 hover:bg-red-800"
            >
              Kaydet
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;
