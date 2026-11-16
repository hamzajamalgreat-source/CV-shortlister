import type { ScoreWeights } from '../../types';

interface Props {
  weights: ScoreWeights;
  onChange: (weights: ScoreWeights) => void;
}

const FIELDS: { key: keyof ScoreWeights; label: string }[] = [
  { key: 'skills',     label: 'Skills %' },
  { key: 'experience', label: 'Experience %' },
  { key: 'projects',   label: 'Projects %' },
  { key: 'education',  label: 'Education %' },
];

export default function WeightInputGroup({ weights, onChange }: Props) {
  const sum = weights.skills + weights.experience + weights.projects + weights.education;
  const valid = sum === 100;

  function handleChange(key: keyof ScoreWeights, value: string) {
    const num = Math.max(0, Math.min(100, parseInt(value, 10) || 0));
    onChange({ ...weights, [key]: num });
  }

  return (
    <fieldset>
      <legend className="block text-sm font-medium text-white mb-3">
        Score Weights <span className="text-gray-400 font-normal">(must total 100%)</span>
      </legend>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {FIELDS.map(({ key, label }) => (
          <div key={key}>
            <label
              htmlFor={`weight-${key}`}
              className="block text-xs font-medium text-gray-300 mb-1"
            >
              {label}
            </label>
            <input
              id={`weight-${key}`}
              type="number"
              min={0}
              max={100}
              value={weights[key]}
              onChange={e => handleChange(key, e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-[#1a1f2e] px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-describedby="weight-sum"
            />
          </div>
        ))}
      </div>
      <p
        id="weight-sum"
        role={valid ? undefined : 'alert'}
        className={`mt-3 text-sm font-medium ${valid ? 'text-green-400' : 'text-red-400'}`}
      >
        Sum: {sum}/100{!valid && ' — Must equal 100'}
      </p>
    </fieldset>
  );
}
