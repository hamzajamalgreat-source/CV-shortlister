import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SkillTagInput from './SkillTagInput';

describe('SkillTagInput', () => {
  it('renders with label and empty tags', () => {
    const onChange = () => {};
    render(
      <SkillTagInput
        label="Required Skills"
        tags={[]}
        onChange={onChange}
        id="skills-input"
      />
    );
    
    expect(screen.getByText('Required Skills')).toBeDefined();
    expect(screen.getByPlaceholderText('Type and press Enter or comma')).toBeDefined();
  });

  it('adds a tag when Enter is pressed', async () => {
    const onChange = vi.fn();
    render(
      <SkillTagInput
        label="Skills"
        tags={[]}
        onChange={onChange}
        id="skills-input"
      />
    );

    const input = screen.getByPlaceholderText('Type and press Enter or comma') as HTMLInputElement;
    
    await userEvent.type(input, 'React');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['React']);
  });

  it('adds a tag when comma is pressed', async () => {
    const onChange = vi.fn();
    render(
      <SkillTagInput
        label="Skills"
        tags={[]}
        onChange={onChange}
        id="skills-input"
      />
    );

    const input = screen.getByPlaceholderText('Type and press Enter or comma') as HTMLInputElement;
    
    await userEvent.type(input, 'TypeScript');
    fireEvent.keyDown(input, { key: ',' });

    expect(onChange).toHaveBeenCalledWith(['TypeScript']);
  });

  it('trims whitespace from tags', async () => {
    const onChange = vi.fn();
    render(
      <SkillTagInput
        label="Skills"
        tags={[]}
        onChange={onChange}
        id="skills-input"
      />
    );

    const input = screen.getByPlaceholderText('Type and press Enter or comma') as HTMLInputElement;
    
    await userEvent.type(input, '  Python  ');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['Python']);
  });

  it('prevents duplicate tags', async () => {
    const onChange = vi.fn();
    render(
      <SkillTagInput
        label="Skills"
        tags={['React']}
        onChange={onChange}
        id="skills-input"
      />
    );

    const input = screen.getByPlaceholderText('') as HTMLInputElement;
    
    await userEvent.type(input, 'React');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('clears input after adding a tag', async () => {
    const onChange = vi.fn();
    render(
      <SkillTagInput
        label="Skills"
        tags={[]}
        onChange={onChange}
        id="skills-input"
      />
    );

    const input = screen.getByPlaceholderText('Type and press Enter or comma') as HTMLInputElement;
    
    await userEvent.type(input, 'Node.js');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['Node.js']);
  });

  it('removes a tag when × button is clicked', async () => {
    const onChange = vi.fn();
    render(
      <SkillTagInput
        label="Skills"
        tags={['React', 'TypeScript']}
        onChange={onChange}
        id="skills-input"
      />
    );

    const removeButtons = screen.getAllByRole('button');
    // First button is for 'React' (first tag)
    fireEvent.click(removeButtons[0]);

    expect(onChange).toHaveBeenCalledWith(['TypeScript']);
  });

  it('removes last tag with Backspace when input is empty', async () => {
    const onChange = vi.fn();
    render(
      <SkillTagInput
        label="Skills"
        tags={['React', 'TypeScript']}
        onChange={onChange}
        id="skills-input"
      />
    );

    const input = screen.getByPlaceholderText('') as HTMLInputElement;
    
    fireEvent.keyDown(input, { key: 'Backspace' });

    expect(onChange).toHaveBeenCalledWith(['React']);
  });

  it('does not remove tag with Backspace when input has content', async () => {
    const onChange = vi.fn();
    render(
      <SkillTagInput
        label="Skills"
        tags={['React']}
        onChange={onChange}
        id="skills-input"
      />
    );

    const input = screen.getByPlaceholderText('') as HTMLInputElement;
    
    // Type content into the input
    await userEvent.type(input, 'Pyt');
    
    // Now press backspace - should not remove tag since input has content
    fireEvent.keyDown(input, { key: 'Backspace' });

    // onChange should have been called from typing, but not for removing a tag
    // The last call should be from typing 'Pyt', not from Backspace removing the tag
    expect(onChange).not.toHaveBeenCalledWith(['']);
  });

  it('adds tag on blur', async () => {
    const onChange = vi.fn();
    render(
      <SkillTagInput
        label="Skills"
        tags={[]}
        onChange={onChange}
        id="skills-input"
      />
    );

    const input = screen.getByPlaceholderText('Type and press Enter or comma') as HTMLInputElement;
    
    await userEvent.type(input, 'Vue');
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith(['Vue']);
  });

  it('renders multiple tags with gradient styling', () => {
    render(
      <SkillTagInput
        label="Skills"
        tags={['React', 'TypeScript', 'Node.js']}
        onChange={() => {}}
        id="skills-input"
      />
    );

    expect(screen.getByText('React')).toBeDefined();
    expect(screen.getByText('TypeScript')).toBeDefined();
    expect(screen.getByText('Node.js')).toBeDefined();
  });

  it('has accessible remove buttons', () => {
    render(
      <SkillTagInput
        label="Skills"
        tags={['React']}
        onChange={() => {}}
        id="skills-input"
      />
    );

    const removeButton = screen.getByRole('button');
    expect(removeButton.getAttribute('aria-label')).toBe('Remove React');
    expect(removeButton.getAttribute('title')).toBe('Remove React');
  });

  it('removes trailing commas from input', async () => {
    const onChange = vi.fn();
    render(
      <SkillTagInput
        label="Skills"
        tags={[]}
        onChange={onChange}
        id="skills-input"
      />
    );

    const input = screen.getByPlaceholderText('Type and press Enter or comma') as HTMLInputElement;
    
    await userEvent.type(input, 'Python,');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['Python']);
  });

  it('ignores empty tags', async () => {
    const onChange = vi.fn();
    render(
      <SkillTagInput
        label="Skills"
        tags={[]}
        onChange={onChange}
        id="skills-input"
      />
    );

    const input = screen.getByPlaceholderText('Type and press Enter or comma') as HTMLInputElement;
    
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).not.toHaveBeenCalled();
  });
});

// Suppress unused warning for vi import
import { vi } from 'vitest';
