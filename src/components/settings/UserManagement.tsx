
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UserRole = {
  role: 'admin' | 'manager' | 'employee';
};

type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export const UserManagement = () => {
  const [filter, setFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: sortOrder === 'asc' });
      
      if (profilesError) throw profilesError;

      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: roles, error: rolesError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);
          
          if (rolesError) {
            console.error('Error fetching roles:', rolesError);
            return { ...profile, user_roles: [] };
          }

          return {
            ...profile,
            user_roles: roles || []
          };
        })
      );

      return usersWithRoles as (UserProfile & { user_roles: UserRole[] })[];
    }
  });

  const filteredUsers = users?.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(filter.toLowerCase());
    const matchesRole = !roleFilter || user.user_roles?.[0]?.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Kullanıcı Yönetimi</h2>
          <Button>Yeni Kullanıcı Ekle</Button>
        </div>
        
        <div className="flex gap-4 mt-4">
          <Input
            placeholder="Kullanıcı ara..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-xs"
          />
          <Select
            value={roleFilter}
            onValueChange={setRoleFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rol seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tüm Roller</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Yönetici</SelectItem>
              <SelectItem value="employee">Çalışan</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortOrder}
            onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sıralama" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">En Eski</SelectItem>
              <SelectItem value="desc">En Yeni</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kullanıcı</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Kayıt Tarihi</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar_url || ''} />
                    <AvatarFallback>
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {user.first_name} {user.last_name}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {user.user_roles?.[0]?.role && (
                  <Badge variant="secondary">
                    {user.user_roles[0].role}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge>Aktif</Badge>
              </TableCell>
              <TableCell>
                {user.created_at && new Date(user.created_at).toLocaleDateString('tr-TR')}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="sm">
                  Düzenle
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                  Devre Dışı Bırak
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
