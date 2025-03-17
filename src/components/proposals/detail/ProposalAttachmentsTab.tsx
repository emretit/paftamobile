
import { useState, useRef } from "react";
import { Proposal, ProposalAttachment } from "@/types/proposal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Paperclip, File, X, Download, FileText, Image } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { v4 as uuidv4 } from "uuid";

interface ProposalAttachmentsTabProps {
  proposal: Proposal;
  isReadOnly?: boolean;
}

export const ProposalAttachmentsTab = ({ 
  proposal,
  isReadOnly = false
}: ProposalAttachmentsTabProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const files = Array.from(e.target.files);
    
    try {
      const newAttachments: ProposalAttachment[] = [];
      
      for (const file of files) {
        const fileId = uuidv4();
        const fileExt = file.name.split('.').pop();
        const fileName = `${proposal.id}/${fileId}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('proposal-attachments')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
          .from('proposal-attachments')
          .getPublicUrl(fileName);
          
        newAttachments.push({
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          url: publicUrl,
          uploaded_at: new Date().toISOString()
        });
      }
      
      // Get current attachments or initialize empty array
      const currentAttachments = proposal.attachments || [];
      
      // Update proposal with new attachments
      const { error } = await supabase
        .from('proposals')
        .update({
          attachments: [...currentAttachments, ...newAttachments]
        })
        .eq('id', proposal.id);
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success("Dosyalar başarıyla yüklendi");
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Dosyalar yüklenirken bir hata oluştu");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  
  const handleDeleteFile = async (attachmentId: string) => {
    if (!proposal.attachments) return;
    
    setIsDeleting(true);
    
    try {
      // Find the attachment to delete
      const attachmentToDelete = proposal.attachments.find(a => a.id === attachmentId);
      if (!attachmentToDelete) return;
      
      // Extract file path from URL
      const fileName = attachmentToDelete.url.split('/').pop();
      const filePath = `${proposal.id}/${fileName}`;
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('proposal-attachments')
        .remove([filePath]);
        
      if (storageError) throw storageError;
      
      // Update proposal attachments
      const updatedAttachments = proposal.attachments.filter(a => a.id !== attachmentId);
      
      const { error } = await supabase
        .from('proposals')
        .update({
          attachments: updatedAttachments
        })
        .eq('id', proposal.id);
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success("Dosya başarıyla silindi");
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Dosya silinirken bir hata oluştu");
    } finally {
      setIsDeleting(false);
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-6 w-6 text-blue-500" />;
    if (type === 'application/pdf') return <FileText className="h-6 w-6 text-red-500" />;
    return <File className="h-6 w-6 text-gray-500" />;
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd.MM.yyyy HH:mm", { locale: tr });
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <div className="space-y-6">
      {!isReadOnly && (
        <div>
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-dashed border-red-200 hover:bg-red-50"
          >
            <Paperclip className="mr-2 h-4 w-4" />
            {isUploading ? 'Yükleniyor...' : 'Dosya Ekle'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}
      
      {(!proposal.attachments || proposal.attachments.length === 0) ? (
        <div className="text-center text-muted-foreground py-8">
          Bu teklife ait dosya bulunmamaktadır.
        </div>
      ) : (
        <div className="space-y-3">
          {proposal.attachments.map((attachment) => (
            <div 
              key={attachment.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-white hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(attachment.type)}
                <div className="space-y-1">
                  <p className="font-medium">{attachment.name}</p>
                  <div className="flex items-center text-xs text-muted-foreground space-x-2">
                    <span>{formatFileSize(attachment.size)}</span>
                    <span>•</span>
                    <span>{formatDate(attachment.uploaded_at)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(attachment.url, '_blank')}
                >
                  <Download className="h-4 w-4 text-red-700" />
                </Button>
                
                {!isReadOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => handleDeleteFile(attachment.id)}
                  >
                    <X className="h-4 w-4 text-red-700" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
