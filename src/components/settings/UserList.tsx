
import { UserWithRoles, UserRole, UserProfile } from "./types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type UserListProps = {
  users: UserWithRoles[];
};

export const UserList = ({ users }: UserListProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      type ProfileUpdate = { is_active: boolean };
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_active: false } satisfies ProfileUpdate)
        .eq('id', userId);
      
      if (updateError) throw updateError;

      const { error: logError } = await supabase
        .from('audit_logs')
        .insert({
          action: 'user_deactivated',
          entity_type: 'user',
          entity_id: userId,
          changes: { is_active: false }
        });

      if (logError) throw logError;
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

  return (
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
        {users.map((user) => (
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
  );
};
