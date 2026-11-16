import StatusBadge from '../common/StatusBadge';
import type { FileUploadState } from '../../hooks/useFileUpload';
import { RefreshCw, File, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const IN_FLIGHT: Set<string> = new Set(['Uploaded', 'Extracting', 'Checking']);

interface Props {
  file: FileUploadState;
  onRetry: (id: string) => void;
}

export default function FileStatusRow({ file, onRetry }: Props) {
  const inFlight = IN_FLIGHT.has(file.status);

  return (
    <li style={{ background: 'rgba(255,255,255,0.6)', border: '2px solid rgba(230,230,250,0.5)' }} className="flex items-center justify-between gap-4 rounded-xl p-4 hover:shadow-md transition">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div style={{ background: inFlight ? '#dbeafe' : file.status === 'Scored' ? '#dcfce7' : file.status === 'Failed' ? '#fee2e2' : '#f3f4f6' }} className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0">
          {inFlight ? (
            <Loader2 size={20} className="text-blue-600 animate-spin" />
          ) : file.status === 'Scored' ? (
            <CheckCircle2 size={20} className="text-green-600" />
          ) : file.status === 'Failed' ? (
            <XCircle size={20} className="text-red-600" />
          ) : (
            <File size={20} className="text-gray-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 truncate" title={file.filename}>
            {file.filename}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {inFlight ? 'Processing...' : file.status}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <StatusBadge status={file.status} />

        {file.status === 'Failed' && (
          <button
            type="button"
            onClick={() => onRetry(file.id)}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition flex items-center gap-1.5"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        )}
      </div>

      {file.error && (
        <div className="sr-only" role="alert">
          {file.filename}: {file.error}
        </div>
      )}
    </li>
  );
}
