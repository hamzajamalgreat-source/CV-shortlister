import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it('renders Scored status with correct colors', () => {
    const { container } = render(<StatusBadge status="Scored" />);
    const badge = container.querySelector('span');
    expect(badge).toBeDefined();
    expect(badge?.textContent).toContain('Scored');
    expect(badge?.style.color).toMatch(/10b981|rgb\(16, 185, 129\)/);
  });

  it('renders Extracting status with purple accent', () => {
    const { container } = render(<StatusBadge status="Extracting" />);
    const badge = container.querySelector('span');
    expect(badge?.textContent).toContain('Extracting');
    expect(badge?.style.color).toMatch(/a78bfa|rgb\(167, 139, 250\)/);
  });

  it('renders Failed status with red accent', () => {
    const { container } = render(<StatusBadge status="Failed" />);
    const badge = container.querySelector('span');
    expect(badge?.textContent).toContain('Failed');
    expect(badge?.style.color).toMatch(/ef4444|rgb\(239, 68, 68\)/);
  });

  it('renders Eligible status with green accent', () => {
    const { container } = render(<StatusBadge status="Eligible" />);
    const badge = container.querySelector('span');
    expect(badge?.textContent).toContain('Eligible');
    expect(badge?.style.color).toMatch(/10b981|rgb\(16, 185, 129\)/);
  });

  it('renders Not_Eligible status with red accent', () => {
    const { container } = render(<StatusBadge status="Not_Eligible" />);
    const badge = container.querySelector('span');
    expect(badge?.textContent).toContain('Not Eligible');
    expect(badge?.style.color).toMatch(/ef4444|rgb\(239, 68, 68\)/);
  });
});
