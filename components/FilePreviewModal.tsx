'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilePreviewModalProps {
  open: boolean;
  onClose: () => void;
  filename: string;
  fileUrl: string;
}

function isPdf(name: string) {
  return name.toLowerCase().endsWith('.pdf');
}

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'xlsx' || ext === 'xls') return FileSpreadsheet;
  return FileText;
}

export function FilePreviewModal({ open, onClose, filename, fileUrl }: FilePreviewModalProps) {
  const canPreview = isPdf(filename);
  const Icon = fileIcon(filename);

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Panel */}
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-[92vw] max-w-5xl rounded-xl border border-border bg-card shadow-xl',
            'flex flex-col',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            canPreview ? 'h-[90vh]' : 'h-auto'
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border px-5 py-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
              <Icon className="h-4 w-4 text-primary" strokeWidth={1.8} />
            </div>
            <Dialog.Title className="flex-1 min-w-0 truncate text-sm font-semibold text-foreground">
              {filename}
            </Dialog.Title>

            <a
              href={fileUrl}
              download={filename}
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={2} />
              Télécharger
            </a>

            <Dialog.Close className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              <X className="h-4 w-4" strokeWidth={2} />
            </Dialog.Close>
          </div>

          {/* Content */}
          {canPreview ? (
            <iframe
              src={fileUrl}
              title={filename}
              className="flex-1 w-full rounded-b-xl"
              style={{ border: 'none', background: '#f4f4f5' }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-accent">
                <Icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Prévisualisation non disponible</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ce format ne peut pas être affiché dans le navigateur.<br />
                  Téléchargez le fichier pour l&apos;ouvrir avec votre application.
                </p>
              </div>
              <a
                href={fileUrl}
                download={filename}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-85"
              >
                <Download className="h-4 w-4" strokeWidth={2} />
                Télécharger {filename}
              </a>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
