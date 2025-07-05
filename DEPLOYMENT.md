# Deployment Guide

This document provides instructions for deploying Menu Visualizer to various platforms.

## Prerequisites

Before deploying, ensure you have:
- Google Gemini API key
- Node.js 18+ runtime environment
- Environment variables properly configured

## Environment Variables

Required environment variables for production:

```bash
GEMINI_API_KEY=your_actual_gemini_api_key
NODE_ENV=production
```

## Deployment Options

### 1. Replit Deployments (Recommended for Development)

The project is already configured for Replit:

1. Ensure your `GEMINI_API_KEY` is set in Replit Secrets
2. Click the "Deploy" button in your Replit interface
3. Configure your deployment settings
4. Your app will be available at `https://your-repl-name.your-username.repl.co`

### 2. Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Configure for Vercel**
   Create `vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server/index.ts",
         "use": "@vercel/node"
       },
       {
         "src": "client/**/*",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "client/dist"
         }
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "server/index.ts"
       },
       {
         "src": "/(.*)",
         "dest": "client/dist/$1"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add GEMINI_API_KEY
   ```

### 3. Railway

1. **Connect GitHub Repository**
   - Go to railway.app
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Start Command: `npm start`

3. **Set Environment Variables**
   - Add `GEMINI_API_KEY` in Railway dashboard
   - Set `NODE_ENV=production`

### 4. Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

3. **Configure Buildpacks**
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set GEMINI_API_KEY=your_key
   heroku config:set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

### 5. DigitalOcean App Platform

1. **Create App**
   - Connect your GitHub repository
   - Choose Node.js environment

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Run Command: `npm start`

3. **Set Environment Variables**
   - Add `GEMINI_API_KEY`
   - Set `NODE_ENV=production`

### 6. Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  menu-visualizer:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    restart: unless-stopped
```

Deploy:
```bash
docker-compose up -d
```

## Production Considerations

### Performance
- Enable gzip compression
- Configure CDN for static assets
- Implement rate limiting for API endpoints
- Monitor API usage and costs

### Security
- Use HTTPS in production
- Implement proper CORS policies
- Validate all user inputs
- Keep dependencies updated

### Monitoring
- Set up error tracking (e.g., Sentry)
- Monitor API response times
- Track Gemini API usage
- Implement health checks

### Scaling
- Consider implementing caching
- Use load balancers for high traffic
- Monitor memory usage
- Implement database if needed

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Ensure TypeScript compiles successfully

2. **API Errors**
   - Verify Gemini API key is correctly set
   - Check API rate limits
   - Monitor error logs

3. **File Upload Issues**
   - Configure proper file size limits
   - Ensure upload directory permissions
   - Check storage space

### Health Check Endpoint

The application includes a health check at `/api/health`:

```bash
curl https://your-domain.com/api/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-05T12:00:00.000Z"
}
```

## Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test API endpoints manually
4. Review platform-specific documentation

## Backup and Recovery

- Regularly backup environment configurations
- Document deployment procedures
- Test recovery procedures
- Keep deployment scripts version controlled