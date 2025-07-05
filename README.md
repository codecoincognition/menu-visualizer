# Menu Visualizer

Transform text-based food menus into stunning visual displays with AI-generated images and intelligent menu analysis.

![Menu Visualizer App Screenshot](client/public/screenshot.png)

## Overview

Menu Visualizer is a cutting-edge web application that uses Google's Gemini AI to transform traditional text menus or uploaded menu images into visually appealing food displays. The app intelligently parses menu items, generates high-quality food images, and presents them in an intuitive interface.

## Features

### Core Functionality
- **Text Menu Processing**: Paste menu text directly and get instant visual results
- **Image Menu Analysis**: Upload menu photos for OCR-based extraction and visualization
- **AI-Powered Food Image Generation**: Creates realistic food images using Google Gemini 2.0 Flash
- **Smart Menu Parsing**: Automatically filters and extracts valid food items while rejecting non-food content
- **Original Input Reference**: View your original menu text or uploaded image alongside results

### User Experience
- **Two-Column Layout**: Persistent input panel on the left, dynamic results on the right
- **Drag & Drop Support**: Easy file uploading with visual feedback
- **Real-time Processing**: Live status updates during AI processing
- **Hover Descriptions**: Detailed food descriptions appear on image hover
- **Text-to-Speech**: Listen to menu items read aloud
- **Responsive Design**: Works seamlessly across desktop and mobile devices

### Technical Features
- **Server-Sent Events**: Real-time progress tracking during menu processing
- **In-Memory Storage**: Fast data management for development and testing
- **Comprehensive Error Handling**: Graceful fallbacks and user-friendly error messages
- **Legal Compliance**: Built-in Terms of Service and Privacy Policy pages

## Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Tailwind CSS** for modern, responsive styling
- **Radix UI** components for accessibility and design consistency
- **Wouter** for lightweight client-side routing
- **React Query** for efficient server state management
- **Vite** for fast development and optimized builds

### Backend
- **Node.js** with Express.js for the API server
- **Google Gemini API** for multimodal AI processing:
  - Gemini 1.5 Flash for text and image analysis
  - Gemini 2.0 Flash for food image generation
- **Multer** for file upload handling
- **TypeScript** for full-stack type safety

### Development Tools
- **Drizzle ORM** (configured for future database integration)
- **ESLint & Prettier** for code quality
- **shadcn/ui** component system

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd menu-visualizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

## Usage

### Processing Text Menus
1. Paste your menu text into the left panel textarea
2. Click "Process Menu" or use the sample menu for testing
3. Watch as AI analyzes and generates food images
4. View results in the right panel with hover descriptions

### Processing Image Menus
1. Drag and drop a menu image onto the upload zone, or click to browse
2. Supported formats: JPG, PNG, WebP (max 10MB)
3. AI will extract text from the image and process menu items
4. Original uploaded image appears in results for reference

### Additional Features
- Click the audio button to hear menu items read aloud
- Use "Go Back" to start processing a new menu
- Click footer links to view Terms of Service or Privacy Policy

## API Endpoints

### POST `/api/process-menu`
Process menu text or uploaded files with streaming responses.

**Request**: 
- Content-Type: `multipart/form-data`
- Body: `{ menuText?: string, file?: File }`

**Response**: Server-Sent Events stream with processing updates

## File Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── lib/            # Utilities and configurations
│   │   └── hooks/          # Custom React hooks
├── server/                 # Backend Express application
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Data storage interface
│   └── vite.ts             # Development server setup
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema definitions
└── package.json            # Project dependencies and scripts
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for AI processing | Yes |
| `NODE_ENV` | Environment mode (development/production) | No |
| `DATABASE_URL` | PostgreSQL connection (future use) | No |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For questions or support, please contact the development team.

---

**Menu Visualizer** - Transforming menus into visual experiences with AI