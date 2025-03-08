
import { useState, useEffect, useMemo } from "react";
import { TableBody, Table } from "@/components/ui/table";
import { useServiceRequests, ServiceRequest } from "@/hooks/useServiceRequests";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import ServiceTableHeader from "./table/ServiceTableHeader";
import ServiceTableRow from "./table/ServiceTableRow";
import { EmptyState, LoadingState } from "./table/ServiceTableStates";
import { useTechnicianNames } from "./hooks/useTechnicianNames";
import type { SortField, SortDirection } from "@/components/tasks/table/types";

interface ServiceRequestTableProps {
  searchQuery: string;
  statusFilter: string | null;
  technicianFilter: string | null;
  onSelectRequest: (request: ServiceRequest) => void;
}

export function ServiceRequestTable({ 
  searchQuery, 
  statusFilter, 
  technicianFilter,
  onSelectRequest
}: ServiceRequestTableProps) {
  const { data: serviceRequests, isLoading } = useServiceRequests();
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { getTechnicianName } = useTechnicianNames();
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Apply filters and sorting when dependencies change
  useEffect(() => {
    if (!serviceRequests) return;

    let results = [...serviceRequests];

    // Apply search filter
    if (searchQuery) {
      results = results.filter(
        (request) =>
          request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      results = results.filter((request) => request.status === statusFilter);
    }

    // Apply technician filter
    if (technicianFilter && technicianFilter !== "all") {
      results = results.filter((request) => request.assigned_to === technicianFilter);
    }

    // Apply sorting
    setFilteredRequests(sortRequests(results, sortField, sortDirection));
  }, [serviceRequests, searchQuery, statusFilter, technicianFilter, sortField, sortDirection]);

  // Sort function
  const sortRequests = (requests: ServiceRequest[], field: SortField, direction: SortDirection) => {
    return [...requests].sort((a, b) => {
      let valueA, valueB;
      
      switch (field) {
        case "title":
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        case "due_date":
          valueA = a.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER;
          valueB = b.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER;
          break;
        case "priority":
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          valueA = priorityOrder[a.priority];
          valueB = priorityOrder[b.priority];
          break;
        case "status":
          valueA = a.status;
          valueB = b.status;
          break;
        case "customer":
          valueA = a.customer_id || "";
          valueB = b.customer_id || "";
          break;
        case "assignee":
          valueA = a.assigned_to || "";
          valueB = b.assigned_to || "";
          break;
        default:
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
      }
      
      const compareResult = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      return direction === "asc" ? compareResult : -compareResult;
    });
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Delete service request
  const deleteServiceRequest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("service_requests")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      toast({
        title: "Servis talebi silindi",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Error deleting service request:", error);
      toast({
        title: "Hata",
        description: "Servis talebi silinemedi",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (!filteredRequests.length) {
    return <EmptyState />;
  }

  return (
    <div className="bg-white rounded-md border overflow-hidden">
      <Table>
        <ServiceTableHeader 
          sortField={sortField}
          sortDirection={sortDirection}
          handleSort={handleSort}
        />
        <TableBody>
          {filteredRequests.map((request) => (
            <ServiceTableRow
              key={request.id}
              request={request}
              onSelectRequest={onSelectRequest}
              onDeleteRequest={(id) => deleteServiceRequest.mutate(id)}
              getTechnicianName={getTechnicianName}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
