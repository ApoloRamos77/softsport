# Frontend Build Artifacts

This directory contains the production build of the frontend application.

## Deployment

This directory is used by Easypanel for deployment:
- **Build Path**: `/publish/frontend`
- **Dockerfile**: Uses nginx to serve static files
- **Auto-deploy**: Yes, from GitHub main branch

## Local Build

To rebuild locally:
```bash
npm run build
```

The output will be generated here by Vite (configured in `vite.config.ts`).
