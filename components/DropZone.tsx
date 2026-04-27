'use client';

import { useRef, useState } from 'react';
import { Upload, CheckCircle, X, FileText, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FilePreviewModal } from './FilePreviewModal';

type UploadState = 'idle' | 'over' | 'uploading' | 'done' | 'error';

interface UploadedFile {
  name: string;
  size: number;
}

interface DropZoneProps {
  automationId: string;
  existingFiles?: UploadedFile[];
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function DropZone({ automationId, existingFiles = [] }: DropZoneProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [uploaded, setUploaded] = useState<UploadedFile[]>(existingFiles);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<UploadedFile | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.ms-excel',
    ];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|docx?|xlsx?)$/i)) {
      setError('Format non supporté. Utilisez PDF, DOCX ou XLSX.');
      setState('error');
      return;
    }

    setState('uploading');
    setError('');

    try {
      const body = new FormData();
      body.append('file', file);

      const res = await fetch(`/api/automations/${automationId}/upload`, {
        method: 'POST',
        body,
      });

      if (!res.ok) throw new Error(await res.text());

      const data: UploadedFile = await res.json();
      setUploaded((prev) => {
        const without = prev.filter((f) => f.name !== data.name);
        return [data, ...without];
      });
      setState('done');
    } catch {
      setError("Erreur lors de l'upload. Réessayez.");
      setState('error');
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setState('idle');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const fileUrl = (name: string) =>
    `/api/automations/${automationId}/files/${encodeURIComponent(name)}`;

  return (
    <>
      <div className="space-y-3">
        {/* Drop zone / status */}
        {state === 'uploading' ? (
          <div className="rounded-lg border border-border p-6 space-y-2">
            <div className="h-3 w-3/5 rounded bg-secondary animate-pulse" />
            <div className="h-2.5 w-2/5 rounded bg-secondary animate-pulse" />
          </div>
        ) : state === 'done' ? (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500">
              <CheckCircle className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{uploaded[0]?.name}</p>
              <p className="text-xs text-muted-foreground">Importé — prêt pour le workflow</p>
            </div>
            <button
              onClick={() => setState('idle')}
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-emerald-500/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors',
              state === 'over'
                ? 'border-primary bg-accent'
                : state === 'error'
                ? 'border-red-400 bg-red-500/5'
                : 'border-border hover:border-primary/50 hover:bg-accent/50'
            )}
            onDragOver={(e) => { e.preventDefault(); setState('over'); }}
            onDragLeave={() => setState('idle')}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              className="hidden"
              onChange={onInputChange}
            />
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <Upload className="h-5 w-5 text-primary" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Glissez un fichier ici</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {state === 'error' ? error : 'PDF, DOCX, XLSX — ou cliquez pour parcourir'}
              </p>
            </div>
          </div>
        )}

        {/* Uploaded files list */}
        {uploaded.length > 0 && (
          <div className="space-y-1.5">
            <p className="label-caps text-muted-foreground">Modèles importés</p>
            {uploaded.map((f) => (
              <div
                key={f.name}
                className="flex items-center gap-2.5 rounded-md border border-border bg-secondary/50 px-3 py-2"
              >
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.8} />
                <span className="flex-1 min-w-0 truncate text-sm text-foreground">{f.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(f.size)}</span>
                <button
                  onClick={() => setPreview(f)}
                  className="shrink-0 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-accent"
                >
                  <Eye className="h-3.5 w-3.5" strokeWidth={2} />
                  Aperçu
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview modal */}
      {preview && (
        <FilePreviewModal
          open={!!preview}
          onClose={() => setPreview(null)}
          filename={preview.name}
          fileUrl={fileUrl(preview.name)}
        />
      )}
    </>
  );
}
