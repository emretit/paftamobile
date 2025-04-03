
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const InviteUserDialog = () => {
  const [newUserEmail, setNewUserEmail] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const inviteUserMutation = useMutation({
    mutationFn: async (email: string) => {
      // Updated to use the correct method
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
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Davet gönderilirken bir hata oluştu: " + error.message,
      });
    },
  });

  return (
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
  );
};
