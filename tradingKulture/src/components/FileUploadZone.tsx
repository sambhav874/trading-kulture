import { cn } from "@/lib/utils";
import { X, Upload, Loader2 , File } from "lucide-react";
import React from "react";
import { useState } from "react";
import { Button } from "react-day-picker";

const FileUploadZone = ({ onFileSelect, uploading }: { onFileSelect: (file: File) => void, uploading: boolean }) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
  
    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };
  
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
  
      const file = e.dataTransfer.files?.[0];
      handleFile(file);
    };
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      handleFile(file);
    };
  
    const handleFile = (file: File | undefined) => {
      if (!file) return;
      
      const fileType = file.name.split('.').pop()?.toLowerCase();
      if (fileType !== 'csv' && fileType !== 'xlsx') {
        alert('Please upload a CSV or Excel file');
        return;
      }
  
      setSelectedFile(file);
      onFileSelect(file);
    };
  
    const removeFile = () => {
      setSelectedFile(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    };
  
    return (
      <div className="w-full">
        <div
          className={cn(
            "relative rounded-lg border-2 border-dashed p-6 transition-all",
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            selectedFile ? "bg-muted/50" : "hover:bg-muted/50"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            {selectedFile ? (
              <>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <File className="w-6 h-6 text-primary" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={removeFile}
                    disabled={uploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Drag & drop your file here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports CSV and Excel files
                  </p>
                </div>
              </>
            )}
            
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  export default FileUploadZone