# CRM Dashboard

A comprehensive CRM system with PitchPal AI integration.

## Features

- **PitchPal AI**: Generate project insights and pitch materials using AI
- **Lead Management**: Track and manage leads from various sources
- **Performance Analytics**: Monitor team performance and metrics
- **Call Analysis**: AI-powered call recording analysis
- **Admin Dashboard**: Manage projects, corrections, and team data

## PitchPal Setup

### Environment Variables

Create a `.env` file in the `crm-dashboard` directory:

```env
# API Configuration for PitchPal
VITE_API_URL=https://api.goyalhariyanacrm.in/

# For local development:
# VITE_API_URL=http://localhost:5000
```

### How PitchPal Works

1. **Project Info Management**: Admins can create/edit project information in the admin dashboard
2. **AI Generation**: When a project has no info, PitchPal generates it using AI
3. **Corrections**: Users can flag incorrect content, which improves future AI generations
4. **Firestore Integration**: All data is stored in Firebase Firestore

### Troubleshooting

#### CORS Errors
- Ensure your backend has CORS headers configured
- Check that the API URL is correct in your `.env` file
- For Vercel/Netlify, ensure CORS headers are set in each API function

#### Firestore Issues
- Check Firebase configuration in `firebase-config.js`
- Ensure Firestore security rules allow read/write access
- Check browser console for connection errors

#### AI Generation Fails
- Verify OpenAI API key is set in backend environment
- Check backend logs for API errors
- Ensure project name is entered correctly

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Check environment variables
npm run check-env

# Build for production
npm run build
```

## Admin Access

Only these emails have admin access:
- pratham.goyalhariyana@gmail.com
- avularudrasekharreddy@gmail.com

Admins can:
- Manage project information
- View and resolve corrections
- Access analytics and reports
- Manage team data#   C R M _ f r o n t e n d 
 
 #   C R M _ f r o n t e n d 
 
 