import { useState, useEffect } from "react";
import { Opportunity, OpportunityStatus } from "@/types/crm";
import { Circle, Square, Triangle, Star, Hexagon, Zap, Target, Check, Clock, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export interface OpportunityColumn {
  id: string;
  title: string;
  icon: any;
  color: string;
}

const defaultColumns: OpportunityColumn[] = [
  { id: "new", title: "Yeni", icon: Circle, color: "bg-blue-600" },
  { id: "first_contact", title: "İlk Görüşme", icon: Square, color: "bg-purple-600" },
  { id: "site_visit", title: "Ziyaret Yapıldı", icon: Triangle, color: "bg-indigo-600" },
  { id: "preparing_proposal", title: "Teklif Hazırlanıyor", icon: Star, color: "bg-amber-600" },
  { id: "proposal_sent", title: "Teklif Gönderildi", icon: Hexagon, color: "bg-yellow-600" },
  { id: "accepted", title: "Kabul Edildi", icon: CheckCircle2, color: "bg-green-600" },
  { id: "lost", title: "Kaybedildi", icon: XCircle, color: "bg-red-600" }
];

const customColumnIcons = [Circle, Square, Triangle, Star, Hexagon, Zap, Target, Check, Clock, ChevronRight];
const customColumnColors = [
  "bg-blue-600", "bg-purple-600", "bg-indigo-600", "bg-amber-600", 
  "bg-yellow-600", "bg-green-600", "bg-red-600", "bg-pink-600", 
  "bg-cyan-600", "bg-orange-600", "bg-teal-600", "bg-lime-600"
];

export const useOpportunityColumns = (
  opportunities: Opportunity[],
  onUpdateOpportunityStatus: (id: string, status: string) => Promise<void>
) => {
  const [columns, setColumns] = useState<OpportunityColumn[]>(defaultColumns);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);

  // Load custom columns from localStorage on mount
  useEffect(() => {
    const savedColumns = localStorage.getItem('opportunity-columns');
    if (savedColumns) {
      try {
        const parsed = JSON.parse(savedColumns);
        setColumns(parsed);
      } catch (error) {
        console.error('Error loading saved columns:', error);
        setColumns(defaultColumns);
      }
    }
  }, []);

  // Save columns to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('opportunity-columns', JSON.stringify(columns));
  }, [columns]);

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) {
      toast.error("Kolon adı gereklidir");
      return;
    }

    // Check if column title already exists
    if (columns.some(col => col.title.toLowerCase() === newColumnTitle.toLowerCase())) {
      toast.error("Bu isimde bir kolon zaten mevcut");
      return;
    }

    // Generate a unique ID based on title
    const id = newColumnTitle.toLowerCase()
      .replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g')
      .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ı/g, 'i')
      .replace(/[^a-z0-9]/g, '_');

    // Select random icon and color for custom columns
    const randomIcon = customColumnIcons[Math.floor(Math.random() * customColumnIcons.length)];
    const randomColor = customColumnColors[Math.floor(Math.random() * customColumnColors.length)];

    const newColumn: OpportunityColumn = {
      id,
      title: newColumnTitle.trim(),
      icon: randomIcon,
      color: randomColor
    };

    setColumns([...columns, newColumn]);
    setNewColumnTitle("");
    setIsAddColumnOpen(false);
    toast.success(`"${newColumn.title}" kolonu eklendi`);
  };

  const handleDeleteColumn = (id: string) => {
    if (isDefaultColumn(id)) {
      toast.error("Varsayılan kolonlar silinemez");
      return;
    }
    setColumnToDelete(id);
  };

  const confirmDeleteColumn = async () => {
    if (!columnToDelete) return;

    try {
      // Find opportunities in this column and move them to "new" status
      const opportunitiesInColumn = opportunities.filter(opp => opp.status === columnToDelete);
      
      // Move all opportunities to "new" status
      for (const opportunity of opportunitiesInColumn) {
        await onUpdateOpportunityStatus(opportunity.id, 'new');
      }

      // Remove the column
      setColumns(prev => prev.filter(col => col.id !== columnToDelete));
      
      const deletedColumn = columns.find(col => col.id === columnToDelete);
      toast.success(`"${deletedColumn?.title}" kolonu silindi. Fırsatlar "Yeni" durumuna taşındı.`);
      
    } catch (error) {
      console.error('Error deleting column:', error);
      toast.error("Kolon silinirken hata oluştu");
    } finally {
      setColumnToDelete(null);
    }
  };

  const isDefaultColumn = (id: string): boolean => {
    return defaultColumns.some(col => col.id === id);
  };

  const handleUpdateColumnTitle = (id: string, newTitle: string) => {
    if (isDefaultColumn(id)) {
      toast.error("Varsayılan kolon isimleri değiştirilemez");
      return;
    }

    setColumns(prev => prev.map(col => 
      col.id === id ? { ...col, title: newTitle } : col
    ));
    toast.success("Kolon adı güncellendi");
  };

  return {
    columns,
    setColumns,
    isAddColumnOpen,
    setIsAddColumnOpen,
    newColumnTitle,
    setNewColumnTitle,
    columnToDelete,
    setColumnToDelete,
    handleAddColumn,
    handleDeleteColumn,
    confirmDeleteColumn,
    isDefaultColumn,
    handleUpdateColumnTitle
  };
};