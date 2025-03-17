
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OpportunityStatus, opportunityStatusLabels } from "@/types/crm";

interface OpportunityFilterBarProps {
  filterKeyword: string;
  setFilterKeyword: (value: string) => void;
  statusFilter: OpportunityStatus | "all";
  setStatusFilter: (value: OpportunityStatus | "all") => void;
  priorityFilter: string | null;
  setPriorityFilter: (value: string | null) => void;
}

const OpportunityFilterBar = ({
  filterKeyword,
  setFilterKeyword,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
}: OpportunityFilterBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50 p-4 rounded-lg">
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <Input
          placeholder="Fırsat ara..."
          value={filterKeyword}
          onChange={(e) => setFilterKeyword(e.target.value)}
          className="max-w-xs"
        />
        
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OpportunityStatus | "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tüm Durumlar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="new">Yeni</SelectItem>
            <SelectItem value="first_contact">İlk Görüşme</SelectItem>
            <SelectItem value="site_visit">Ziyaret Yapıldı</SelectItem>
            <SelectItem value="preparing_proposal">Teklif Hazırlanıyor</SelectItem>
            <SelectItem value="proposal_sent">Teklif Gönderildi</SelectItem>
            <SelectItem value="accepted">Kabul Edildi</SelectItem>
            <SelectItem value="lost">Kaybedildi</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={priorityFilter || "all"} 
          onValueChange={(value) => setPriorityFilter(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Öncelik Seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Öncelikler</SelectItem>
            <SelectItem value="high">Yüksek</SelectItem>
            <SelectItem value="medium">Orta</SelectItem>
            <SelectItem value="low">Düşük</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button variant="outline" className="sm:ml-auto">
        <Filter className="mr-2 h-4 w-4" />
        Filtreler
      </Button>
    </div>
  );
};

export default OpportunityFilterBar;
