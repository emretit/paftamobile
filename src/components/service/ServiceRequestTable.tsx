
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User } from 'lucide-react';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  customer_id: string;
  assigned_to: string;
  due_date: string;
  location: string;
  service_type: string;
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  assigned: "bg-purple-100 text-purple-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  on_hold: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export function ServiceRequestTable() {
  const { data: serviceRequests, isLoading } = useQuery({
    queryKey: ['service-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
          customer:customers(name),
          technician:employees(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return <div>Loading service requests...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Location</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {serviceRequests.map((request: any) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.title}</TableCell>
              <TableCell>{request.customer?.name}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={statusColors[request.status as keyof typeof statusColors]}>
                  {request.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={priorityColors[request.priority as keyof typeof priorityColors]}>
                  {request.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {request.technician ? `${request.technician.first_name} ${request.technician.last_name}` : 'Unassigned'}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(request.due_date).toLocaleDateString()}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {request.location}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
