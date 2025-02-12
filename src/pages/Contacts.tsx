
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Phone, Mail, Edit2, Trash2, MoreHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ContactsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  type: "bireysel" | "kurumsal";
  status: "aktif" | "pasif" | "potansiyel";
  representative: string | null;
  last_interaction: string;
  balance: number;
}

const Contacts = ({ isCollapsed, setIsCollapsed }: ContactsProps) => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }
      
      return data as Customer[];
    }
  });

  const filteredCustomers = customers?.filter(customer => {
    const matchesSearch = !search || 
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email?.toLowerCase().includes(search.toLowerCase()) ||
      customer.company?.toLowerCase().includes(search.toLowerCase());

    const matchesType = !typeFilter || customer.type === typeFilter;
    const matchesStatus = !statusFilter || customer.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-white flex relative">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 p-4 sm:p-8 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Müşteriler</h1>
            <p className="text-gray-600 mt-1">Müşteri listesi ve yönetimi</p>
          </div>
          <button className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary/90 transition-colors">
            <Plus className="h-5 w-5" />
            <span>Yeni Müşteri</span>
          </button>
        </div>

        <div className="mb-6 flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Müşteri ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select 
            className="border rounded-lg px-3 py-2"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Tüm Tipler</option>
            <option value="bireysel">Bireysel</option>
            <option value="kurumsal">Kurumsal</option>
          </select>
          <select 
            className="border rounded-lg px-3 py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tüm Durumlar</option>
            <option value="aktif">Aktif</option>
            <option value="pasif">Pasif</option>
            <option value="potansiyel">Potansiyel</option>
          </select>
        </div>

        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Müşteri Adı</TableHead>
                <TableHead>İletişim</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Temsilci</TableHead>
                <TableHead>Bakiye</TableHead>
                <TableHead>Son Etkileşim</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : filteredCustomers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Müşteri bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers?.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p>{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.company}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {customer.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{customer.type}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          customer.status === "aktif"
                            ? "bg-green-100 text-green-800"
                            : customer.status === "pasif"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {customer.status}
                      </span>
                    </TableCell>
                    <TableCell>{customer.representative}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${customer.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {customer.balance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(customer.last_interaction).toLocaleDateString('tr-TR')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Edit2 className="h-4 w-4 text-gray-500" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Trash2 className="h-4 w-4 text-gray-500" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreHorizontal className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </main>
    </div>
  );
};

export default Contacts;
