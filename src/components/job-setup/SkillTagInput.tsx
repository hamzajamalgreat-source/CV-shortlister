import { useState, KeyboardEvent } from 'react';

interface Props {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  id: string;
}

export default function SkillTagInput({ label, tags, onChange, id }: Props) {
  const [input, setInput] = useState('');

  function addTag() {
    const trimmed = input.trim().replace(/,+$/, '');
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    onChange(tags.filter(t => t !== tag));
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-white mb-2">
        {label}
      </label>
      <div className="min-h-[44px] w-full flex flex-wrap gap-2 rounded-lg px-3 py-2.5" style={{ backgroundColor: '#1a1f2e' }}>
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium text-white"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            }}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
              className="inline-flex items-center justify-center w-4 h-4 rounded hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
              title={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={id}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? 'Type and press Enter or comma' : ''}
          className="flex-1 min-w-[140px] border-none outline-none bg-transparent text-sm text-white placeholder-gray-400"
          style={{ color: '#ffffff' }}
          aria-label={label}
        />
      </div>
      <p className="mt-1.5 text-xs text-gray-400">Press Enter or comma to add a tag</p>
    </div>
  );
}
