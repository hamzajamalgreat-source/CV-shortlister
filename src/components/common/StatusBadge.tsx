import React from 'react';
import type { ProcessingStatus, EligibilityStatus } from '../../types';
import { 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  HelpCircle,
  Clock,
  ShieldCheck,
  ShieldX
} from 'lucide-react';

type Status = ProcessingStatus | EligibilityStatus;

const BADGE_CONFIG: Record<Status, { 
  label: string;
  bgColor: string;
  textColor: string;
  icon: React.ReactNode;
  description: string;
}> = {
  Uploaded: { 
    label: 'Uploaded',
    bgColor: '#242d3f',
    textColor: '#b4bcc9',
    icon: React.createElement(Upload, { size: 12 }),
    description: 'File uploaded successfully'
  },
  Extracting: { 
    label: 'Extracting',
    bgColor: '#7c3aed1a',
    textColor: '#a78bfa',
    icon: React.createElement(RefreshCw, { size: 12, className: 'animate-spin' }),
    description: 'Extracting text from CV'
  },
  Checking: { 
    label: 'Checking',
    bgColor: '#fbbf241a',
    textColor: '#fbbf24',
    icon: React.createElement(Clock, { size: 12 }),
    description: 'Checking against criteria'
  },
  Scored: { 
    label: 'Scored',
    bgColor: '#10b9811a',
    textColor: '#10b981',
    icon: React.createElement(CheckCircle, { size: 12 }),
    description: 'Scoring completed'
  },
  Failed: { 
    label: 'Failed',
    bgColor: '#ef44441a',
    textColor: '#ef4444',
    icon: React.createElement(XCircle, { size: 12 }),
    description: 'Processing failed'
  },
  Needs_Review: { 
    label: 'Needs Review',
    bgColor: '#f59e0b1a',
    textColor: '#f59e0b',
    icon: React.createElement(AlertCircle, { size: 12 }),
    description: 'Requires manual review'
  },
  Eligible: { 
    label: 'Eligible',
    bgColor: '#10b9811a',
    textColor: '#10b981',
    icon: React.createElement(ShieldCheck, { size: 12 }),
    description: 'Meets all requirements'
  },
  Not_Eligible: { 
    label: 'Not Eligible',
    bgColor: '#ef44441a',
    textColor: '#ef4444',
    icon: React.createElement(ShieldX, { size: 12 }),
    description: 'Does not meet requirements'
  },
};

export default function StatusBadge({ status }: { status: Status }) {
  const config = BADGE_CONFIG[status] ?? { 
    label: status,
    bgColor: '#242d3f',
    textColor: '#b4bcc9',
    icon: React.createElement(HelpCircle, { size: 12 }),
    description: 'Unknown status'
  };

  const ariaLabel = config.label + ' - ' + config.description;

  return (
    <span 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        backgroundColor: config.bgColor,
        color: config.textColor,
      }}
      title={config.description}
      aria-label={ariaLabel}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
