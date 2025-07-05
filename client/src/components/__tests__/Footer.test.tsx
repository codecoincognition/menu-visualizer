import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '../Footer'

// Mock wouter Link component
vi.mock('wouter', () => ({
  Link: ({ href, children, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

describe('Footer', () => {
  it('should render copyright notice', () => {
    render(<Footer />)
    
    expect(screen.getByText(/© 2025 Menu Visualizer. All Rights Reserved./)).toBeInTheDocument()
  })

  it('should render Terms of Service link', () => {
    render(<Footer />)
    
    const termsLink = screen.getByRole('link', { name: /Terms of Service/ })
    expect(termsLink).toBeInTheDocument()
    expect(termsLink).toHaveAttribute('href', '/terms-of-service')
  })

  it('should render Privacy Policy link', () => {
    render(<Footer />)
    
    const privacyLink = screen.getByRole('link', { name: /Privacy Policy/ })
    expect(privacyLink).toBeInTheDocument()
    expect(privacyLink).toHaveAttribute('href', '/privacy-policy')
  })

  it('should have proper styling classes', () => {
    const { container } = render(<Footer />)
    const footer = container.querySelector('footer')
    
    expect(footer).toHaveClass('fixed', 'bottom-0', 'left-0', 'right-0')
    expect(footer).toHaveClass('bg-white', 'border-t', 'border-gray-200')
  })

  it('should have links with hover styles', () => {
    render(<Footer />)
    
    const termsLink = screen.getByRole('link', { name: /Terms of Service/ })
    const privacyLink = screen.getByRole('link', { name: /Privacy Policy/ })
    
    expect(termsLink).toHaveClass('text-gray-600', 'hover:text-gray-900', 'underline')
    expect(privacyLink).toHaveClass('text-gray-600', 'hover:text-gray-900', 'underline')
  })
})