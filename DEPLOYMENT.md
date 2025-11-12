# Vercel Deployment Guide - Monorepo Setup

This guide will help you deploy both the **Backend (NestJS)** and **Frontend (Expo Web)** to Vercel from your monorepo.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally
   ```bash
   npm install -g vercel
   ```
3. **External Services**:
   - MongoDB Atlas account (or other hosted MongoDB)
   - Redis hosting (Upstash, Redis Cloud, etc.)
   - ImageKit account for image storage

## Project Structure

```
narayana/
├── src/              # Backend NestJS code
├── dist/             # Backend build output
├── frontend/         # Frontend Expo app
│   ├── src/
│   └── vercel.json   # Frontend Vercel config
├── vercel.json       # Backend Vercel config
└── package.json      # Backend dependencies
```

---

## Backend Deployment

### Step 1: Build the Backend Locally

```bash
cd /Users/saurabhpandey/Desktop/narayana
npm run build
```

This creates the `dist/` folder with compiled code.

### Step 2: Set Up External Services

Before deploying, set up:

#### MongoDB Atlas
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string: `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database>`

#### Redis (Upstash Recommended)
1. Go to [upstash.com](https://upstash.com)
2. Create a Redis database
3. Get connection details (host, port, password)

#### ImageKit
1. Go to [imagekit.io](https://imagekit.io)
2. Get your public key, private key, and URL endpoint

### Step 3: Deploy Backend to Vercel

```bash
cd /Users/saurabhpandey/Desktop/narayana
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Select your account
- **Link to existing project?** No (first time)
- **Project name?** `narayana-backend` (or your choice)
- **Directory?** `.` (current directory)
- **Override settings?** No

### Step 4: Configure Backend Environment Variables

After deployment, add environment variables via Vercel Dashboard or CLI:

```bash
# Via Vercel Dashboard (Recommended)
# Go to: Project Settings → Environment Variables

# Or via CLI:
vercel env add NODE_ENV
vercel env add PORT
vercel env add MONGODB_URI
vercel env add REDIS_HOST
vercel env add REDIS_PORT
vercel env add REDIS_PASSWORD
vercel env add JWT_SECRET
vercel env add JWT_EXPIRATION
vercel env add JWT_REFRESH_SECRET
vercel env add JWT_REFRESH_EXPIRATION
vercel env add EMAIL_HOST
vercel env add EMAIL_PORT
vercel env add EMAIL_USER
vercel env add EMAIL_PASSWORD
vercel env add EMAIL_FROM
vercel env add IMAGEKIT_PUBLIC_KEY
vercel env add IMAGEKIT_PRIVATE_KEY
vercel env add IMAGEKIT_URL_ENDPOINT
vercel env add ADMIN_EMAIL
vercel env add ADMIN_PASSWORD
```

**Important Environment Variables:**
| Variable | Value Example | Description |
|----------|---------------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB connection string |
| `REDIS_HOST` | `xxx.upstash.io` | Redis host from Upstash |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | `your-password` | Redis password |
| `JWT_SECRET` | `random-secret-key` | JWT signing secret |

### Step 5: Redeploy Backend

After adding environment variables:

```bash
vercel --prod
```

**Your backend URL will be:** `https://narayana-backend.vercel.app` (or similar)

---

## Frontend Deployment

### Step 1: Update Frontend Config

The frontend API config has been updated to use environment variables.

Edit [frontend/src/config/api.config.ts](frontend/src/config/api.config.ts) and replace:
```typescript
: process.env.EXPO_PUBLIC_API_URL || 'https://your-backend.vercel.app', // Production
```

With your actual backend URL:
```typescript
: process.env.EXPO_PUBLIC_API_URL || 'https://narayana-backend.vercel.app', // Production
```

### Step 2: Deploy Frontend to Vercel

```bash
cd /Users/saurabhpandey/Desktop/narayana/frontend
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Select your account
- **Link to existing project?** No (first time)
- **Project name?** `narayana-frontend` (or your choice)
- **Directory?** `.` (current directory - the frontend folder)
- **Override settings?** No

### Step 3: Configure Frontend Environment Variables

Add the backend API URL:

```bash
vercel env add EXPO_PUBLIC_API_URL
# Enter: https://narayana-backend.vercel.app (your backend URL)
```

### Step 4: Redeploy Frontend

```bash
vercel --prod
```

**Your frontend URL will be:** `https://narayana-frontend.vercel.app` (or similar)

---

## Post-Deployment Steps

### 1. Seed the Database

After backend is deployed, seed your database:

```bash
# Use Vercel CLI to run commands on your deployment
vercel env pull .env.production
npm run seed
npm run seed:admin
```

Or connect to your MongoDB Atlas directly and run the seed scripts locally.

### 2. Test the Deployment

1. Open your frontend URL: `https://narayana-frontend.vercel.app`
2. Try logging in with admin credentials
3. Test API endpoints

### 3. Update CORS Settings

If you get CORS errors, update your backend's CORS settings in [src/main.ts](src/main.ts):

```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://narayana-frontend.vercel.app', // Add your frontend URL
  ],
  credentials: true,
});
```

Then redeploy the backend:
```bash
cd /Users/saurabhpandey/Desktop/narayana
vercel --prod
```

---

## Vercel Dashboard Management

### View Deployments
```bash
vercel ls
```

### View Logs
```bash
vercel logs [deployment-url]
```

### Remove Environment Variable
```bash
vercel env rm VARIABLE_NAME
```

### Link Project to Existing Vercel Project
```bash
vercel link
```

---

## Troubleshooting

### Backend Issues

**"Cannot find module 'dist/main.js'"**
- Run `npm run build` before deploying
- Ensure `dist/` folder exists

**Database Connection Errors**
- Verify MongoDB connection string
- Check if MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Ensure environment variables are set correctly

**Redis Connection Errors**
- Verify Redis credentials
- Check Redis host and port
- Ensure Upstash/Redis Cloud allows connections

### Frontend Issues

**API Connection Errors**
- Verify `EXPO_PUBLIC_API_URL` is set correctly
- Check backend CORS settings
- Ensure backend is deployed and running

**Build Failures**
- Clear cache: `rm -rf .expo node_modules && npm install`
- Try building locally: `npm run build`

**Blank Page on Deployment**
- Check browser console for errors
- Verify all assets are loading correctly
- Check Vercel build logs

---

## Quick Commands Reference

### Backend
```bash
# Deploy backend
cd /Users/saurabhpandey/Desktop/narayana
vercel --prod

# View backend logs
vercel logs --prod

# Add environment variable
vercel env add VARIABLE_NAME
```

### Frontend
```bash
# Deploy frontend
cd /Users/saurabhpandey/Desktop/narayana/frontend
vercel --prod

# View frontend logs
vercel logs --prod

# Test build locally
npm run build
```

---

## Environment Variables Checklist

### Backend (Root)
- [ ] `NODE_ENV`
- [ ] `PORT`
- [ ] `MONGODB_URI`
- [ ] `REDIS_HOST`
- [ ] `REDIS_PORT`
- [ ] `REDIS_PASSWORD`
- [ ] `JWT_SECRET`
- [ ] `JWT_EXPIRATION`
- [ ] `JWT_REFRESH_SECRET`
- [ ] `JWT_REFRESH_EXPIRATION`
- [ ] `EMAIL_HOST`
- [ ] `EMAIL_PORT`
- [ ] `EMAIL_USER`
- [ ] `EMAIL_PASSWORD`
- [ ] `EMAIL_FROM`
- [ ] `IMAGEKIT_PUBLIC_KEY`
- [ ] `IMAGEKIT_PRIVATE_KEY`
- [ ] `IMAGEKIT_URL_ENDPOINT`
- [ ] `ADMIN_EMAIL`
- [ ] `ADMIN_PASSWORD`

### Frontend
- [ ] `EXPO_PUBLIC_API_URL`

---

## Custom Domain (Optional)

### Add Domain to Backend
1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain (e.g., `api.yourdomain.com`)
3. Configure DNS records as instructed

### Add Domain to Frontend
1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain (e.g., `yourdomain.com`)
3. Configure DNS records as instructed

---

## Monitoring and Analytics

### Enable Vercel Analytics
1. Go to Project Settings → Analytics
2. Enable Analytics for performance monitoring

### Enable Vercel Logs
- Logs are automatically available in the dashboard
- Access via: Dashboard → Project → Logs

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review environment variables
3. Test backend API endpoints directly
4. Check browser console for frontend errors

**Useful Resources:**
- [Vercel Documentation](https://vercel.com/docs)
- [NestJS Deployment Guide](https://docs.nestjs.com/deployment)
- [Expo Web Guide](https://docs.expo.dev/guides/deploying-to-web/)
