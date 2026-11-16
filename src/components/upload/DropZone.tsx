import { useRef, useState } from 'react';
import { Upload, File, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const MAX_BYTES = 10 * 1024 * 1024;

function validateFile(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ACCEPTED_TYPES.has(file.type) && ext !== 'pdf' && ext !== 'docx') {
    return `${file.name}: only PDF and DOCX accepted.`;
  }
  if (file.size > MAX_BYTES) {
    return `${file.name}: exceeds 10 MB limit.`;
  }
  return null;
}

export default function DropZone({ onFilesSelected, disabled = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  function processFiles(fileList: FileList | null) {
    if (!fileList || disabled) return;
    const files = Array.from(fileList);
    const validationErrors: string[] = [];
    const accepted: File[] = [];
    for (const file of files) {
      const err = validateFile(file);
      if (err) validationErrors.push(err);
      else accepted.push(file);
    }
    setErrors(validationErrors);
    if (accepted.length > 0) {
      onFilesSelected(accepted);
      setErrors([]);
    }
  }

  const bgStyle = dragging && !disabled
    ? {
        background: 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.15) 100%)',
        borderColor: '#667eea',
      }
    : {
        background: 'rgba(15,23,42,0.4)',
        borderColor: 'rgba(148,163,184,0.3)',
      };

  const iconBg = dragging && !disabled ? 'rgba(102,126,234,0.2)' : 'rgba(148,163,184,0.1)';
  const iconColor = dragging && !disabled ? '#667eea' : '#94a3b8';
  const textColor = disabled ? 'rgba(255,255,255,0.5)' : '#ffffff';
  const subtextColor = disabled ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.7)';

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Drop CV files here or click to select"
        aria-disabled={disabled}
        onDragOver={(e) => {
          if (!disabled) {
            e.preventDefault();
            setDragging(true);
          }
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          if (!disabled) {
            e.preventDefault();
            setDragging(false);
            processFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => {
          if (!disabled) inputRef.current?.click();
        }}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            inputRef.current?.click();
          }
        }}
        style={bgStyle}
        className={`flex flex-col items-center justify-center gap-6 rounded-2xl border-2 border-dashed p-16 transition-all ${
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-opacity-100'
        }`}
      >
        <div
          style={{ background: iconBg }}
          className="h-24 w-24 rounded-2xl flex items-center justify-center"
        >
          <Upload size={40} style={{ color: iconColor }} />
        </div>

        <div className="text-center">
          <h3 style={{ color: textColor }} className="text-2xl font-bold mb-2">
            {dragging && !disabled ? 'Drop your CVs here' : 'Upload CV Files'}
          </h3>
          <p style={{ color: subtextColor }} className="mb-1">
            Drag and drop PDF or DOCX files, or click to browse
          </p>
          <p style={{ color: subtextColor }} className="text-sm">
            Max 10 MB per file
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <span
            style={{
              background: 'rgba(102,126,234,0.15)',
              color: '#667eea',
            }}
            className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2"
          >
            <File size={14} />
            PDF
          </span>
          <span
            style={{
              background: 'rgba(102,126,234,0.15)',
              color: '#667eea',
            }}
            className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2"
          >
            <File size={14} />
            DOCX
          </span>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx"
          onChange={(e) => {
            processFiles(e.target.files);
            e.target.value = '';
          }}
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      {errors.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 p-4 bg-red-900/30 border-2 border-red-700 rounded-lg">
            <AlertCircle size={20} style={{ color: '#fca5a5' }} />
            <span style={{ color: '#fecaca' }} className="font-semibold">
              Upload issues
            </span>
          </div>
          <ul className="space-y-2">
            {errors.map((err, i) => (
              <li key={i} className="flex items-center gap-3 p-3 bg-red-900/20 border border-red-700 rounded-lg">
                <XCircle size={16} style={{ color: '#fca5a5' }} />
                <span style={{ color: '#fecaca' }} className="text-sm">
                  {err}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {errors.length === 0 && dragging && !disabled && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 border-2 border-green-700 rounded-lg">
            <CheckCircle2 size={18} style={{ color: '#86efac' }} />
            <span style={{ color: '#bbf7d0' }} className="font-semibold">
              Ready to upload
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
