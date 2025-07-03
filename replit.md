# Multimodal AI Application

## Overview

This is a full-stack educational application demonstrating multimodal AI capabilities, specifically image analysis and text-to-speech functionality. The application allows users to upload images, analyze them using Google's Gemini Vision API, and listen to the analysis results using browser-based text-to-speech.

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
- **API Integration**: Google Gemini API for image analysis
- **File Handling**: Multer for multipart/form-data processing
- **Storage**: In-memory storage with interface for future database integration

### Key Components

#### Image Processing Pipeline
1. **File Upload**: Multer middleware handles image uploads with validation
2. **Format Conversion**: Images converted to base64 for Gemini API
3. **AI Analysis**: Google Gemini 2.5 Flash model analyzes uploaded images
4. **Result Storage**: Analysis results stored in memory with structured schema

#### Text-to-Speech Integration
- Browser-based Speech Synthesis API
- Playback controls with speed adjustment
- Progress tracking and visual feedback
- Fallback handling for unsupported browsers

#### UI Components
- **ImageUpload**: Drag-and-drop file upload with preview
- **ImageAnalysis**: Results display with copy functionality
- **AudioPlayer**: Text-to-speech playback with controls
- **CodeExamples**: Educational modal showing implementation details

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
Changelog:
- July 03, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```