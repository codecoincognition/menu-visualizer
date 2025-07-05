# Menu Visualizer Application

## Overview

This is a full-stack food menu visualization application that transforms text-based menu items into visual displays with AI-generated food images. The application uses Google's Gemini API to parse menu text, extract food items, and create engaging visual presentations with text-to-speech functionality to read menu items aloud.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter (lightweight React router)
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Integration**: Google Gemini API for text parsing and image generation
- **File Handling**: Multer for multipart/form-data processing (images and text files)
- **Image Generation**: Gemini 2.0 Flash with Unsplash fallback for food images
- **Storage**: In-memory storage with interface for future database integration

### Key Components

#### Menu Processing Pipeline
1. **Text Input**: Users can paste menu text or upload text files
2. **Image Input**: Users can upload menu images (JPG, PNG) for OCR processing
3. **AI Parsing**: Google Gemini 1.5 Flash extracts food items from text or images
4. **Food Item Extraction**: Filters valid food items and generates descriptions
5. **Image Generation**: Gemini 2.0 Flash generates realistic food images with Unsplash fallback
6. **Result Storage**: Menu items stored in memory with structured schema

#### Text-to-Speech Integration
- Browser-based Speech Synthesis API for reading menu items aloud
- Play/pause controls for menu narration
- Comprehensive menu reading functionality
- Fallback handling for unsupported browsers

#### UI Components
- **MenuInput**: Text input area with file upload support
- **MenuResults**: Visual grid display of food items with images
- **AudioPlayer**: Text-to-speech functionality for menu items
- **Navigation**: Bottom navigation bar matching mobile design patterns

## Data Flow

1. **Image Upload**: User selects/drops image file
2. **Client Validation**: File type and size validation on frontend
3. **API Request**: Image sent to `/api/analyze-image` endpoint
4. **Gemini Processing**: Image analyzed using Gemini 2.5 Flash model
5. **Response Storage**: Results stored in memory with unique ID
6. **UI Update**: Analysis results displayed with audio playback option
7. **Text-to-Speech**: Browser synthesizes speech from analysis text

## External Dependencies

### Core Dependencies
- **Google Gemini API**: Image analysis via Gemini 2.5 Flash model
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **React Query**: Server state management and caching

### Development Dependencies
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety and development experience
- **ESLint/Prettier**: Code formatting and linting
- **Drizzle**: Database ORM (configured for future use)

### API Configuration
- OpenAI API key required via environment variable
- File upload limits: 10MB max size
- Supported formats: PNG, JPG, JPEG, WebP

## Deployment Strategy

### Development Setup
- `npm run dev`: Starts development server with hot reloading
- Vite dev server proxies API requests to Express backend
- Environment variables loaded from `.env` file

### Production Build
- `npm run build`: Compiles TypeScript and bundles assets
- Static assets served from Express server
- Single-process deployment with Express serving both API and frontend

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (future use)
- `GEMINI_API_KEY`: Google Gemini API authentication
- `NODE_ENV`: Environment mode (development/production)

### Database Schema
Drizzle ORM configured with PostgreSQL schema:
- `imageAnalyses` table with id, imageData, analysisText, createdAt
- Migration system ready for database deployment
- Current implementation uses in-memory storage

## Changelog

```
- July 05, 2025: Added footer and legal pages
  - Created fixed footer with copyright notice and links
  - Added Terms of Service page with comprehensive legal content
  - Added Privacy Policy page with data handling information
  - Implemented proper routing for new legal pages
  - Added bottom padding to all pages to accommodate fixed footer

- July 05, 2025: Transformed app into Menu Visualizer
  - Updated schema for menu items and sessions
  - Added text and image menu processing with Gemini AI
  - Integrated food image generation with Gemini 2.0 Flash
  - Added file upload support for menu images and text files
  - Implemented text-to-speech for menu reading
  - Created mobile-friendly UI matching design specifications

- July 03, 2025: Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```