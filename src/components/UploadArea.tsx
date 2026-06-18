import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Trash2, ShieldCheck } from 'lucide-react';

interface UploadAreaProps {
  onFileUploaded: (fileUrl: string, fileName: string) => void;
  onFileCleared: () => void;
  uploadedFileName: string | undefined;
}

export function UploadArea(props: UploadAreaProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = (fileName: string) => {
    // Basic file extension checking
    const validExtensions = ['.pdf', '.ai', '.eps', '.jpg', '.jpeg', '.png'];
    const lowerName = fileName.toLowerCase();
    const isValid = validExtensions.some(ext => lowerName.endsWith(ext));

    if (!isValid) {
      setErrorText("Ongeldig bestandsformaat. Upload a.b.b. een PDF, EPS, AI, of JPG formaat met CMYK kleurprofiel.");
      return;
    }

    setErrorText(null);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          // Standard placeholder mockup image for layout previews
          props.onFileUploaded('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400', fileName);
          return 100;
        }
        return prev + 15;
      });
    }, 150);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      simulateUpload(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      simulateUpload(file.name);
    }
  };

  const clearFile = () => {
    setUploadProgress(null);
    setErrorText(null);
    props.onFileCleared();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-800">1. Aanleverspecificaties &amp; Ontwerp</h4>
          <p className="text-xs text-slate-500 mt-0.5">Laad je drukklaar ontwerpbestand met 3mm afloopmarge.</p>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
          <ShieldCheck className="h-3 w-3" />
          <span>Gratis bestandscontrole</span>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.ai,.eps,.jpg,.jpeg,.png"
      />

      {props.uploadedFileName ? (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-4 transition-all animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <FileText className="h-5 w-5" />
              </div>
              <div className="truncate">
                <p className="truncate text-xs font-bold text-slate-800 max-w-[200px] sm:max-w-[340px]" title={props.uploadedFileName}>
                  {props.uploadedFileName}
                </p>
                <p className="text-[10px] font-medium text-emerald-600 flex items-center mt-0.5">
                  <CheckCircle2 className="h-3 w-3 mr-1 shrink-0" />
                  <span>Drukklaar bestand geladen • Afloopmarge gecontroleerd</span>
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="rounded-md p-1.5 text-slate-400 hover:bg-white hover:text-rose-500 transition-colors cursor-pointer"
              aria-label="Bestand verwijderen"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed h-40 text-center px-4 cursor-pointer transition-all duration-200 ${
            isDragActive 
              ? 'border-indigo-500 bg-indigo-50/20' 
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/45 hover:bg-slate-50'
          }`}
        >
          {uploadProgress !== null && uploadProgress < 100 ? (
            <div className="w-full max-w-[240px]">
              <p className="text-xs font-semibold text-slate-600 mb-2">Prepress bestandscontrole...</p>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all duration-150" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">{uploadProgress}% gecontroleerd</p>
            </div>
          ) : (
            <>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm border border-slate-200">
                <Upload className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Sleep je printbestand hierheen of <span className="text-indigo-600 underline">klik om te bladeren</span>
              </p>
              <p className="text-[10.5px] text-slate-400 mt-1">
                Aanbevolen: PDF, AI, EPS of High-Res JPG (min. 300 DPI)
              </p>
            </>
          )}
        </div>
      )}

      {errorText && (
        <div className="flex items-start space-x-2 rounded-lg bg-rose-50 p-3 mt-3 border border-rose-100 animate-fade-in">
          <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-[11.5px] font-medium leading-relaxed text-rose-700">{errorText}</p>
        </div>
      )}
    </div>
  );
}
