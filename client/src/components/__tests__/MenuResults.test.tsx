import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MenuResults from '../MenuResults';

const mockMenuItems = [
  {
    id: 1,
    name: 'Grilled Salmon',
    description: 'Fresh salmon grilled with herbs and lemon',
    imageUrl: 'https://example.com/salmon.jpg',
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 2,
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with Caesar dressing and croutons',
    imageUrl: 'https://example.com/caesar.jpg',
    createdAt: new Date('2025-01-01'),
  },
];

describe('MenuResults Component', () => {
  const mockOnBack = vi.fn();
  const originalInput = 'Grilled Salmon\nCaesar Salad';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders menu items', () => {
    render(
      <MenuResults 
        menuItems={mockMenuItems}
        onBack={mockOnBack}
        originalInput={originalInput}
      />
    );
    
    expect(screen.getByText('Grilled Salmon')).toBeInTheDocument();
    expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    expect(screen.getByText('Fresh salmon grilled with herbs and lemon')).toBeInTheDocument();
    expect(screen.getByText('Crisp romaine lettuce with Caesar dressing and croutons')).toBeInTheDocument();
  });

  it('shows menu images', () => {
    render(
      <MenuResults 
        menuItems={mockMenuItems}
        onBack={mockOnBack}
        originalInput={originalInput}
      />
    );
    
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(mockMenuItems.length);
    expect(images[0]).toHaveAttribute('src', 'https://example.com/salmon.jpg');
    expect(images[1]).toHaveAttribute('src', 'https://example.com/caesar.jpg');
  });

  it('calls onBack when back button is clicked', () => {
    render(
      <MenuResults 
        menuItems={mockMenuItems}
        onBack={mockOnBack}
        originalInput={originalInput}
      />
    );
    
    const backButton = screen.getByText('New Menu');
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('renders empty state when no menu items', () => {
    render(
      <MenuResults 
        menuItems={[]}
        onBack={mockOnBack}
        originalInput={originalInput}
      />
    );
    
    expect(screen.getByText('No menu items found')).toBeInTheDocument();
  });

  it('shows correct number of items', () => {
    render(
      <MenuResults 
        menuItems={mockMenuItems}
        onBack={mockOnBack}
        originalInput={originalInput}
      />
    );
    
    expect(screen.getByText('2 Items Found')).toBeInTheDocument();
  });

  it('handles item hover effects', () => {
    render(
      <MenuResults 
        menuItems={mockMenuItems}
        onBack={mockOnBack}
        originalInput={originalInput}
      />
    );
    
    const menuItem = screen.getByText('Grilled Salmon').closest('.menu-item');
    expect(menuItem).toHaveClass('hover:scale-105');
  });

  it('displays audio player controls', () => {
    render(
      <MenuResults 
        menuItems={mockMenuItems}
        onBack={mockOnBack}
        originalInput={originalInput}
      />
    );
    
    expect(screen.getByText('🔊 Read Menu Aloud')).toBeInTheDocument();
  });
});