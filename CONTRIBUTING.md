# Contributing to Menu Visualizer

Thank you for your interest in contributing to Menu Visualizer! This document provides guidelines for contributing to the project.

## Development Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Google Gemini API key

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/menu-visualizer.git
   cd menu-visualizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your Gemini API key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── lib/            # Utilities and configurations
│   │   └── hooks/          # Custom React hooks
├── server/                 # Express backend
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Data management
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
└── attached_assets/        # Static assets
```

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Use meaningful variable and function names
- Add comments for complex logic

### Frontend Development
- Use React hooks and functional components
- Leverage Tailwind CSS for styling
- Use shadcn/ui components when possible
- Implement proper error handling and loading states

### Backend Development
- Follow RESTful API conventions
- Use proper HTTP status codes
- Implement comprehensive error handling
- Validate all input data with Zod schemas

### AI Integration
- Use Google Gemini API responsibly
- Implement proper rate limiting
- Handle API failures gracefully
- Never expose API keys in client-side code

## Testing

Currently, the project uses manual testing. Future contributions should include:
- Unit tests for utility functions
- Integration tests for API endpoints
- E2E tests for critical user flows

## Submitting Changes

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Test your changes thoroughly
   - Update documentation if needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

4. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Provide a clear description of changes
   - Reference any related issues
   - Include screenshots for UI changes

### Commit Message Format

Use conventional commits format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

## Code Review Guidelines

### For Contributors
- Ensure code follows project conventions
- Test changes in multiple browsers
- Verify mobile responsiveness
- Check for accessibility issues

### For Reviewers
- Focus on code quality and maintainability
- Check for potential security issues
- Verify proper error handling
- Ensure documentation is updated

## Issue Reporting

When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screenshots or error messages

## Feature Requests

For new features:
- Describe the use case clearly
- Explain the expected behavior
- Consider implementation complexity
- Discuss potential alternatives

## Security

- Never commit API keys or sensitive data
- Report security vulnerabilities privately
- Use environment variables for configuration
- Validate all user inputs

## Questions?

Feel free to open an issue for:
- Technical questions
- Clarification on guidelines
- Discussion of new features
- General project feedback

Thank you for contributing to Menu Visualizer!