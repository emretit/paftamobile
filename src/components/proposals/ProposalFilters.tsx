
import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusStyles } from "./constants";
import { Plus } from "lucide-react";
import { ProposalFiltersProps } from "./types";

export const ProposalFilters = ({
  onSearchChange,
  onStatusChange,
  onDateRangeChange,
  selectedStatus,
  onFilterChange,
}: ProposalFiltersProps) => {
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearchChange(e.target.value);
    
    // Call the combined filter change if it exists
    if (onFilterChange) {
      onFilterChange({
        search: e.target.value,
        status: selectedStatus !== 'all' ? selectedStatus : undefined
      });
    }
  };
  
  const handleStatusChange = (value: string) => {
    onStatusChange(value);
    
    // Call the combined filter change if it exists
    if (onFilterChange) {
      onFilterChange({
        search: searchValue,
        status: value !== 'all' ? value : undefined
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6 items-end">
      <div>
        <Label htmlFor="search">Teklif Ara</Label>
        <Input
          id="search"
          placeholder="Teklif ara..."
          value={searchValue}
          onChange={handleSearchChange}
        />
      </div>

      <div>
        <Label htmlFor="status">Durum</Label>
        <Select
          value={selectedStatus}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Tüm durumlar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm durumlar</SelectItem>
            <SelectItem value="discovery_scheduled">🔎 Discovery</SelectItem>
            <SelectItem value="meeting_completed">👥 Meeting Completed</SelectItem>
            <SelectItem value="sent">📤 Sent</SelectItem>
            <SelectItem value="negotiation">🔄 Negotiation</SelectItem>
            <SelectItem value="approved">✅ Approved</SelectItem>
            <SelectItem value="rejected">❌ Rejected</SelectItem>
            <SelectItem value="converted_to_order">📦 Ordered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="md:col-span-3 lg:col-span-2 flex justify-end">
        <Button asChild>
          <Link to="/proposals/new" className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add New Proposal
          </Link>
        </Button>
      </div>
    </div>
  );
};
