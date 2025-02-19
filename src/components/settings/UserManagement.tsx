
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

type UserRole = {
  id: string;
  user_id: string;
  role: 'admin' | 'sales' | 'manager' | 'viewer';
  created_at: string;
};

type UserProfile = {
  id: string;
  email?: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export const UserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [newUserEmail, setNewUserEmail] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Fetch profiles and roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: sortOrder === 'asc' });
      
      if (profilesError) throw profilesError;

      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: roles, error: rolesError } = await supabase
            .from('user_roles')
            .select('*')
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

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: UserRole['role'] }) => {
      const { error } = await supabase.rpc('assign_role', {
        target_user_id: userId,
        new_role: role
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Başarılı",
        description: "Kullanıcı rolü güncellendi",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Rol güncellenirken bir hata oluştu: " + error.message,
      });
    },
  });

  const inviteUserMutation = useMutation({
    mutationFn: async (email: string) => {
      // Instead of using admin functions, we'll use the magic link feature
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Başarılı",
        description: "Kullanıcıya davet e-postası gönderildi",
      });
      setNewUserEmail("");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Davet gönderilirken bir hata oluştu: " + error.message,
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.rpc('request_password_reset', {
        email: email
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Şifre sıfırlama bağlantısı gönderildi",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Şifre sıfırlama işlemi başarısız: " + error.message,
      });
    },
  });

  const deactivateUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Update profile status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', userId);
      
      if (updateError) throw updateError;

      // Log the deactivation
      await supabase.from('audit_logs').insert({
        action: 'user_deactivated',
        entity_type: 'user',
        entity_id: userId,
        changes: { is_active: false }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Başarılı",
        description: "Kullanıcı devre dışı bırakıldı",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kullanıcı devre dışı bırakılırken bir hata oluştu: " + error.message,
      });
    },
  });

  const filteredUsers = users?.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(filter.toLowerCase());
    const matchesRole = !roleFilter || user.user_roles?.some(r => r.role === roleFilter);
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
          <Dialog>
            <DialogTrigger asChild>
              <Button>Yeni Kullanıcı Davet Et</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Kullanıcı Daveti Gönder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="E-posta adresi"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
                <Button 
                  onClick={() => inviteUserMutation.mutate(newUserEmail)}
                  disabled={inviteUserMutation.isPending}
                >
                  {inviteUserMutation.isPending ? "Gönderiliyor..." : "Davet Gönder"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
              <SelectItem value="all">Tüm Roller</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="sales">Satış</SelectItem>
              <SelectItem value="manager">Yönetici</SelectItem>
              <SelectItem value="viewer">Görüntüleyici</SelectItem>
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
                <Select
                  value={user.user_roles?.[0]?.role || "viewer"}
                  onValueChange={(role: UserRole['role']) => 
                    assignRoleMutation.mutate({ userId: user.id, role })}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue>
                      {user.user_roles?.[0]?.role ? (
                        <Badge variant="secondary">
                          {user.user_roles[0].role}
                        </Badge>
                      ) : (
                        "Rol seç"
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="sales">Satış</SelectItem>
                    <SelectItem value="manager">Yönetici</SelectItem>
                    <SelectItem value="viewer">Görüntüleyici</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Badge>{user.is_active !== false ? "Aktif" : "Devre Dışı"}</Badge>
              </TableCell>
              <TableCell>
                {user.created_at && new Date(user.created_at).toLocaleDateString('tr-TR')}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => resetPasswordMutation.mutate(user.email || '')}
                >
                  Şifre Sıfırla
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700"
                  onClick={() => {
                    if (window.confirm('Bu kullanıcıyı devre dışı bırakmak istediğinizden emin misiniz?')) {
                      deactivateUserMutation.mutate(user.id);
                    }
                  }}
                >
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
