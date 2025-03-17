
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, File, Trash } from "lucide-react";
import { ProposalAttachment } from "@/types/proposal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProposalAttachmentsProps {
  proposalId: string;
  attachments: ProposalAttachment[];
}

const ProposalAttachments = ({ proposalId, attachments }: ProposalAttachmentsProps) => {
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});

  if (!attachments.length) {
    return <div className="py-4 text-center text-gray-500">Bu teklif için dosya eklenmemiş.</div>;
  }

  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    else if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    else return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDownload = async (attachment: ProposalAttachment) => {
    try {
      const { data, error } = await supabase.storage
        .from("proposal_attachments")
        .download(`${proposalId}/${attachment.name}`);
      
      if (error) throw error;
      
      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Dosya indirme işlemi başarısız");
    }
  };

  const handleDelete = async (attachment: ProposalAttachment) => {
    try {
      setIsDeleting(prev => ({ ...prev, [attachment.id]: true }));
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("proposal_attachments")
        .remove([`${proposalId}/${attachment.name}`]);
      
      if (storageError) throw storageError;
      
      // Delete record from database
      const { error: dbError } = await supabase
        .from("proposal_attachments")
        .delete()
        .eq("id", attachment.id);
      
      if (dbError) throw dbError;
      
      toast.success("Dosya başarıyla silindi");
      // Ideally would refresh the attachments list here
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Dosya silme işlemi başarısız");
    } finally {
      setIsDeleting(prev => ({ ...prev, [attachment.id]: false }));
    }
  };

  return (
    <div className="space-y-4">
      {attachments.map((attachment) => (
        <Card key={attachment.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <File size={20} className="text-blue-500" />
                <div className="overflow-hidden">
                  <p className="font-medium truncate">{attachment.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(attachment.size)} • {new Date(attachment.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDownload(attachment)}
                  className="h-8 w-8 p-0"
                >
                  <Download size={16} />
                  <span className="sr-only">İndir</span>
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDelete(attachment)}
                  className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  disabled={isDeleting[attachment.id]}
                >
                  <Trash size={16} />
                  <span className="sr-only">Sil</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProposalAttachments;
