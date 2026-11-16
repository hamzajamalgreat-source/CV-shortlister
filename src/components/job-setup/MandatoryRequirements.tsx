import { useState, KeyboardEvent } from 'react';

interface Props {
  requirements: string[];
  onChange: (requirements: string[]) => void;
}

export default function MandatoryRequirements({ requirements, onChange }: Props) {
  const [input, setInput] = useState('');

  function addRequirement() {
    const trimmed = input.trim().replace(/,+$/, '');
    if (trimmed && !requirements.includes(trimmed)) {
      onChange([...requirements, trimmed]);
    }
    setInput('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addRequirement();
    } else if (e.key === 'Backspace' && input === '' && requirements.length > 0) {
      onChange(requirements.slice(0, -1));
    }
  }

  function removeRequirement(req: string) {
    onChange(requirements.filter(r => r !== req));
  }

  return (
    <div>
      <label htmlFor="mandatory-requirements" className="block text-sm font-medium text-white mb-2">
        Mandatory Requirements
      </label>
      <div className="min-h-[44px] w-full flex flex-wrap gap-2 rounded-lg px-3 py-2.5" style={{ backgroundColor: '#1a1f2e' }}>
        {requirements.map(req => (
          <span
            key={req}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium text-white"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            }}
          >
            {req}
            <button
              type="button"
              onClick={() => removeRequirement(req)}
              aria-label={`Remove ${req}`}
              className="inline-flex items-center justify-center w-4 h-4 rounded hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
              title={`Remove ${req}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id="mandatory-requirements"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addRequirement}
          placeholder={requirements.length === 0 ? 'Type and press Enter or comma' : ''}
          className="flex-1 min-w-[140px] border-none outline-none bg-transparent text-sm text-white placeholder-gray-400"
          style={{ color: '#ffffff' }}
          aria-label="Mandatory requirements"
        />
      </div>
      <p className="mt-1.5 text-xs text-gray-400">Press Enter or comma to add a requirement</p>
    </div>
  );
}
