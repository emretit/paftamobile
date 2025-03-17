
import React from 'react';
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  setPriorityFilter
}: OpportunityFilterBarProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <div className="relative w-full md:w-auto max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <Input
          placeholder="Fırsat ara..."
          className="pl-10 w-full"
          value={filterKeyword}
          onChange={(e) => setFilterKeyword(e.target.value)}
        />
      </div>
      
      <div className="flex flex-wrap gap-3 w-full md:w-auto">
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as OpportunityStatus | "all")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Durum" />
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
          value={priorityFilter || ""}
          onValueChange={(value) => setPriorityFilter(value === "" ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Öncelik" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tüm Öncelikler</SelectItem>
            <SelectItem value="high">Yüksek</SelectItem>
            <SelectItem value="medium">Orta</SelectItem>
            <SelectItem value="low">Düşük</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default OpportunityFilterBar;
