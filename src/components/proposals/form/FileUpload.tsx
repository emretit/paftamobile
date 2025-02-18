
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Upload } from "lucide-react";

interface FileUploadProps {
  files: File[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
}

const FileUpload = ({ files, onFileChange, onRemoveFile }: FileUploadProps) => {
  return (
    <div className="space-y-4">
      <Label>Dosya Ekleri</Label>
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
          <Upload className="w-4 h-4 mr-2" />
          Dosya Yükle
        </Button>
        <input
          id="file-upload"
          type="file"
          multiple
          onChange={onFileChange}
          className="hidden"
        />
      </div>
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveFile(index)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
