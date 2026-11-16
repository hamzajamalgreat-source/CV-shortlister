import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WeightInputGroup from './WeightInputGroup';
import type { ScoreWeights } from '../../types';

describe('WeightInputGroup', () => {
  let onChange: any;

  beforeEach(() => {
    onChange = vi.fn();
  });

  describe('rendering', () => {
    it('renders four labeled numeric inputs', () => {
      render(
        <WeightInputGroup
          weights={{ skills: 25, experience: 25, projects: 25, education: 25 }}
          onChange={onChange}
        />
      );

      expect(screen.getByLabelText('Skills %')).toBeDefined();
      expect(screen.getByLabelText('Experience %')).toBeDefined();
      expect(screen.getByLabelText('Projects %')).toBeDefined();
      expect(screen.getByLabelText('Education %')).toBeDefined();
    });

    it('displays current weight values in inputs', () => {
      const weights: ScoreWeights = {
        skills: 40,
        experience: 30,
        projects: 20,
        education: 10,
      };

      render(<WeightInputGroup weights={weights} onChange={onChange} />);

      expect((screen.getByLabelText('Skills %') as HTMLInputElement).value).toBe('40');
      expect((screen.getByLabelText('Experience %') as HTMLInputElement).value).toBe('30');
      expect((screen.getByLabelText('Projects %') as HTMLInputElement).value).toBe('20');
      expect((screen.getByLabelText('Education %') as HTMLInputElement).value).toBe('10');
    });

    it('renders with dark-mode styling', () => {
      const { container } = render(
        <WeightInputGroup
          weights={{ skills: 25, experience: 25, projects: 25, education: 25 }}
          onChange={onChange}
        />
      );

      const inputs = container.querySelectorAll('input[type="number"]');
      inputs.forEach(input => {
        const className = input.className;
        expect(className).toContain('bg-[#1a1f2e]');
        expect(className).toContain('text-white');
        expect(className).toContain('border-gray-700');
      });
    });

    it('renders legend with instruction text', () => {
      render(
        <WeightInputGroup
          weights={{ skills: 25, experience: 25, projects: 25, education: 25 }}
          onChange={onChange}
        />
      );

      expect(screen.getByText('Score Weights')).toBeDefined();
      expect(screen.getByText(/(must total 100%)/)).toBeDefined();
    });
  });

  describe('sum display', () => {
    it('displays correct sum when valid', () => {
      render(
        <WeightInputGroup
          weights={{ skills: 25, experience: 25, projects: 25, education: 25 }}
          onChange={onChange}
        />
      );

      const sumDisplay = screen.getByText(/Sum: 100\/100/);
      expect(sumDisplay).toBeDefined();
    });

    it('displays correct sum when invalid', () => {
      render(
        <WeightInputGroup
          weights={{ skills: 40, experience: 30, projects: 20, education: 5 }}
          onChange={onChange}
        />
      );

      const sumDisplay = screen.getByText(/Sum: 95\/100 — Must equal 100/);
      expect(sumDisplay).toBeDefined();
    });

    it('shows sum in GREEN when equal to 100', () => {
      const { container } = render(
        <WeightInputGroup
          weights={{ skills: 25, experience: 25, projects: 25, education: 25 }}
          onChange={onChange}
        />
      );

      const sumDisplay = container.querySelector('#weight-sum');
      expect(sumDisplay?.className).toContain('text-green-400');
      expect(sumDisplay?.className).not.toContain('text-red-400');
    });

    it('shows sum in RED when not equal to 100', () => {
      const { container } = render(
        <WeightInputGroup
          weights={{ skills: 50, experience: 20, projects: 20, education: 5 }}
          onChange={onChange}
        />
      );

      const sumDisplay = container.querySelector('#weight-sum');
      expect(sumDisplay?.className).toContain('text-red-400');
      expect(sumDisplay?.className).not.toContain('text-green-400');
    });

    it('sets role="alert" on sum display when invalid', () => {
      const { container } = render(
        <WeightInputGroup
          weights={{ skills: 50, experience: 30, projects: 10, education: 5 }}
          onChange={onChange}
        />
      );

      const sumDisplay = container.querySelector('#weight-sum');
      expect(sumDisplay?.getAttribute('role')).toBe('alert');
    });

    it('does not set role="alert" on sum display when valid', () => {
      const { container } = render(
        <WeightInputGroup
          weights={{ skills: 25, experience: 25, projects: 25, education: 25 }}
          onChange={onChange}
        />
      );

      const sumDisplay = container.querySelector('#weight-sum');
      expect(sumDisplay?.getAttribute('role')).not.toBe('alert');
    });
  });

  describe('input validation', () => {
    it('enforces 0-100 range on input change', async () => {
      render(
        <WeightInputGroup
          weights={{ skills: 25, experience: 25, projects: 25, education: 25 }}
          onChange={onChange}
        />
      );

      const skillsInput = screen.getByLabelText('Skills %') as HTMLInputElement;

      fireEvent.change(skillsInput, { target: { value: '150' } });

      // onChange should be called with clamped value of 100
      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall[0].skills).toBe(100);
    });

    it('clamps negative values to 0', () => {
      render(
        <WeightInputGroup
          weights={{ skills: 25, experience: 25, projects: 25, education: 25 }}
          onChange={onChange}
        />
      );

      const skillsInput = screen.getByLabelText('Skills %') as HTMLInputElement;

      fireEvent.change(skillsInput, { target: { value: '-10' } });

      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall[0].skills).toBe(0);
    });

    it('handles empty input as 0', () => {
      render(
        <WeightInputGroup
          weights={{ skills: 25, experience: 25, projects: 25, education: 25 }}
          onChange={onChange}
        />
      );

      const skillsInput = screen.getByLabelText('Skills %') as HTMLInputElement;

      fireEvent.change(skillsInput, { target: { value: '' } });

      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall[0].skills).toBe(0);
    });

    it('preserves other weights when one changes', () => {
      render(
        <WeightInputGroup
          weights={{ skills: 30, experience: 25, projects: 25, education: 20 }}
          onChange={onChange}
        />
      );

      const experienceInput = screen.getByLabelText('Experience %') as HTMLInputElement;

      fireEvent.change(experienceInput, { target: { value: '40' } });

      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      const updatedWeights = lastCall[0];

      expect(updatedWeights.skills).toBe(30);
      expect(updatedWeights.experience).toBe(40);
      expect(updatedWeights.projects).toBe(25);
      expect(updatedWeights.education).toBe(20);
    });

    it('accepts valid numeric inputs in 0-100 range', () => {
      render(
        <WeightInputGroup
          weights={{ skills: 25, experience: 25, projects: 25, education: 25 }}
          onChange={onChange}
        />
      );

      const skillsInput = screen.getByLabelText('Skills %') as HTMLInputElement;

      fireEvent.change(skillsInput, { target: { value: '50' } });

      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall[0].skills).toBe(50);
    });
  });

  describe('accessibility', () => {
    it('associates labels with inputs', () => {
      render(
        <WeightInputGroup
          weights={{ skills: 25, experience: 25, projects: 25, education: 25 }}
          onChange={onChange}
        />
      );

      const skillsInput = screen.getByLabelText('Skills %');
      expect(skillsInput).toBeDefined();
      expect(skillsInput.id).toBe('weight-skills');
    });

    it('includes aria-describedby on inputs pointing to sum display', () => {
      const { container } = render(
        <WeightInputGroup
          weights={{ skills: 25, experience: 25, projects: 25, education: 25 }}
          onChange={onChange}
        />
      );

      const inputs = container.querySelectorAll('input[type="number"]');
      inputs.forEach(input => {
        expect(input.getAttribute('aria-describedby')).toBe('weight-sum');
      });
    });
  });

  describe('property: live sum accuracy', () => {
    // Property test: For any four numeric inputs representing weights,
    // the displayed sum equals their arithmetic sum, and the error state
    // is true if and only if the sum does not equal 100.
    // Validates: Requirements 2.8, 2.9

    const testCases: Array<[ScoreWeights, number, boolean]> = [
      [{ skills: 25, experience: 25, projects: 25, education: 25 }, 100, true],
      [{ skills: 0, experience: 0, projects: 0, education: 100 }, 100, true],
      [{ skills: 100, experience: 0, projects: 0, education: 0 }, 100, true],
      [{ skills: 50, experience: 30, projects: 10, education: 10 }, 100, true],
      [{ skills: 40, experience: 30, projects: 20, education: 5 }, 95, false],
      [{ skills: 50, experience: 30, projects: 10, education: 15 }, 105, false],
      [{ skills: 0, experience: 0, projects: 0, education: 0 }, 0, false],
      [{ skills: 1, experience: 1, projects: 1, education: 1 }, 4, false],
      [{ skills: 33, experience: 33, projects: 33, education: 1 }, 100, true],
      [{ skills: 70, experience: 15, projects: 10, education: 5 }, 100, true],
    ];

    testCases.forEach(([weights, expectedSum, shouldBeValid]) => {
      it(`computes correct sum and validity for weights ${JSON.stringify(weights)}`, () => {
        const { container } = render(
          <WeightInputGroup weights={weights} onChange={onChange} />
        );

        const sumDisplay = container.querySelector('#weight-sum');
        const textContent = sumDisplay?.textContent || '';

        // Sum should be in text
        expect(textContent).toContain(`${expectedSum}/100`);

        // Valid state should match
        if (shouldBeValid) {
          expect(sumDisplay?.className).toContain('text-green-400');
        } else {
          expect(sumDisplay?.className).toContain('text-red-400');
          expect(textContent).toContain('Must equal 100');
        }
      });
    });
  });
});
