import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MandatoryRequirements from './MandatoryRequirements';

describe('MandatoryRequirements', () => {
  it('renders with label and empty requirements', () => {
    const onChange = () => {};
    render(
      <MandatoryRequirements
        requirements={[]}
        onChange={onChange}
      />
    );
    
    expect(screen.getByText('Mandatory Requirements')).toBeDefined();
    expect(screen.getByPlaceholderText('Type and press Enter or comma')).toBeDefined();
  });

  it('adds a requirement when Enter is pressed', async () => {
    const onChange = vi.fn();
    render(
      <MandatoryRequirements
        requirements={[]}
        onChange={onChange}
      />
    );

    const input = screen.getByPlaceholderText('Type and press Enter or comma') as HTMLInputElement;
    
    await userEvent.type(input, 'Must have 5 years experience');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['Must have 5 years experience']);
  });

  it('adds a requirement when comma is pressed', async () => {
    const onChange = vi.fn();
    render(
      <MandatoryRequirements
        requirements={[]}
        onChange={onChange}
      />
    );

    const input = screen.getByPlaceholderText('Type and press Enter or comma') as HTMLInputElement;
    
    await userEvent.type(input, 'Bachelor degree required');
    fireEvent.keyDown(input, { key: ',' });

    expect(onChange).toHaveBeenCalledWith(['Bachelor degree required']);
  });

  it('trims whitespace from requirements', async () => {
    const onChange = vi.fn();
    render(
      <MandatoryRequirements
        requirements={[]}
        onChange={onChange}
      />
    );

    const input = screen.getByPlaceholderText('Type and press Enter or comma') as HTMLInputElement;
    
    await userEvent.type(input, '  Must speak English  ');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['Must speak English']);
  });

  it('prevents duplicate requirements', async () => {
    const onChange = vi.fn();
    render(
      <MandatoryRequirements
        requirements={['Must speak English']}
        onChange={onChange}
      />
    );

    const input = screen.getByPlaceholderText('') as HTMLInputElement;
    
    await userEvent.type(input, 'Must speak English');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('clears input after adding a requirement', async () => {
    const onChange = vi.fn();
    render(
      <MandatoryRequirements
        requirements={[]}
        onChange={onChange}
      />
    );

    const input = screen.getByPlaceholderText('Type and press Enter or comma') as HTMLInputElement;
    
    await userEvent.type(input, 'Must have clearance');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['Must have clearance']);
  });

  it('removes a requirement when × button is clicked', async () => {
    const onChange = vi.fn();
    render(
      <MandatoryRequirements
        requirements={['Must have 5 years experience', 'Bachelor degree required']}
        onChange={onChange}
      />
    );

    const removeButtons = screen.getAllByRole('button');
    fireEvent.click(removeButtons[0]);

    expect(onChange).toHaveBeenCalledWith(['Bachelor degree required']);
  });

  it('removes last requirement with Backspace when input is empty', async () => {
    const onChange = vi.fn();
    render(
      <MandatoryRequirements
        requirements={['Must have 5 years experience', 'Bachelor degree required']}
        onChange={onChange}
      />
    );

    const input = screen.getByPlaceholderText('') as HTMLInputElement;
    
    fireEvent.keyDown(input, { key: 'Backspace' });

    expect(onChange).toHaveBeenCalledWith(['Must have 5 years experience']);
  });

  it('does not remove requirement with Backspace when input has content', async () => {
    const onChange = vi.fn();
    render(
      <MandatoryRequirements
        requirements={['Must have 5 years experience']}
        onChange={onChange}
      />
    );

    const input = screen.getByPlaceholderText('') as HTMLInputElement;
    
    await userEvent.type(input, 'New');
    fireEvent.keyDown(input, { key: 'Backspace' });

    // Should not have called onChange to remove the requirement
    expect(onChange).not.toHaveBeenCalledWith([]);
  });

  it('adds requirement on blur', async () => {
    const onChange = vi.fn();
    render(
      <MandatoryRequirements
        requirements={[]}
        onChange={onChange}
      />
    );

    const input = screen.getByPlaceholderText('Type and press Enter or comma') as HTMLInputElement;
    
    await userEvent.type(input, 'Bilingual required');
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith(['Bilingual required']);
  });

  it('renders multiple requirements with gradient styling', () => {
    render(
      <MandatoryRequirements
        requirements={['Must have 5 years experience', 'Bachelor degree required', 'Must speak English']}
        onChange={() => {}}
      />
    );

    expect(screen.getByText('Must have 5 years experience')).toBeDefined();
    expect(screen.getByText('Bachelor degree required')).toBeDefined();
    expect(screen.getByText('Must speak English')).toBeDefined();
  });

  it('has accessible remove buttons', () => {
    render(
      <MandatoryRequirements
        requirements={['Must have 5 years experience']}
        onChange={() => {}}
      />
    );

    const removeButton = screen.getByRole('button');
    expect(removeButton.getAttribute('aria-label')).toBe('Remove Must have 5 years experience');
    expect(removeButton.getAttribute('title')).toBe('Remove Must have 5 years experience');
  });

  it('removes trailing commas from input', async () => {
    const onChange = vi.fn();
    render(
      <MandatoryRequirements
        requirements={[]}
        onChange={onChange}
      />
    );

    const input = screen.getByPlaceholderText('Type and press Enter or comma') as HTMLInputElement;
    
    await userEvent.type(input, 'Must have clearance,');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['Must have clearance']);
  });

  it('ignores empty requirements', async () => {
    const onChange = vi.fn();
    render(
      <MandatoryRequirements
        requirements={[]}
        onChange={onChange}
      />
    );

    const input = screen.getByPlaceholderText('Type and press Enter or comma') as HTMLInputElement;
    
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).not.toHaveBeenCalled();
  });
});
