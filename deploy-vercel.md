# DoggieChef Vercel Deployment Guide 🚀

This guide will help you deploy your DoggieChef recipe collection website to Vercel.

## Prerequisites 📋

1. **Vercel Account**: [Sign up at vercel.com](https://vercel.com)
2. **Cloudinary Account**: [Sign up at cloudinary.com](https://cloudinary.com) for image hosting
3. **Git Repository**: Your code should be in a GitHub/GitLab repository
4. **Vercel CLI** (optional): `npm i -g vercel`

## Step 1: Set Up Cloudinary 🖼️

1. **Create Cloudinary Account**:
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up for a free account
   - Note down your **Cloud Name**, **API Key**, and **API Secret**

2. **Configure Upload Settings**:
   - In Cloudinary dashboard, go to Settings → Upload
   - Enable "Use filename as Public ID" (optional)
   - Set upload folder to "doggiechef" (optional)

## Step 2: Prepare Your Repository 📁

1. **Clone the Repository**:
   ```bash
   git clone <your-repo-url>
   cd DoggieChef
   ```

2. **Verify Project Structure**:
   ```
   DoggieChef/
   ├── api/                 # Serverless functions
   ├── frontend/            # React app
   ├── vercel.json          # Vercel config
   ├── requirements.txt     # Python deps
   └── package.json         # Root package.json
   ```

3. **Install Dependencies Locally** (for testing):
   ```bash
   cd frontend && npm install
   ```

## Step 3: Deploy via Vercel Dashboard 🌐

### Option A: GitHub Integration (Recommended)

1. **Connect Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select "DoggieChef" project

2. **Configure Build Settings**:
   - **Framework Preset**: React
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

3. **Add Environment Variables**:
   - In project settings, go to "Environment Variables"
   - Add the following variables:
     ```
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option B: Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**:
   ```bash
   vercel env add CLOUDINARY_CLOUD_NAME
   vercel env add CLOUDINARY_API_KEY
   vercel env add CLOUDINARY_API_SECRET
   ```

## Step 4: Configure Custom Domain (Optional) 🌍

1. **Add Domain**:
   - Go to project settings in Vercel dashboard
   - Click "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

2. **SSL Certificate**:
   - Vercel automatically provides SSL certificates
   - Your site will be available at `https://yourdomain.com`

## Step 5: Test Your Deployment ✅

1. **Basic Functionality**:
   - Visit your deployed URL
   - Test navigation between pages
   - Try adding a recipe (without photos first)

2. **Photo Upload**:
   - Try uploading a photo
   - Check if it appears in Cloudinary dashboard
   - Verify photo displays correctly in the app

3. **API Endpoints**:
   - Test `/api/recipes` - should return empty array initially
   - Test `/api/stats` - should return zero counts
   - Test `/api/filters` - should return empty arrays

## Troubleshooting 🔧

### Common Issues:

1. **Build Fails**:
   - Check if `frontend/package.json` has correct dependencies
   - Ensure React build completes locally first

2. **API Errors**:
   - Verify environment variables are set correctly
   - Check Vercel function logs in dashboard

3. **Photo Upload Fails**:
   - Confirm Cloudinary credentials are correct
   - Check Cloudinary upload settings

4. **Database Issues**:
   - SQLite resets on each deployment (expected)
   - Consider upgrading to persistent database for production

### Debug Steps:

1. **Check Vercel Logs**:
   ```bash
   vercel logs your-project-url
   ```

2. **Test API Locally**:
   ```bash
   cd backend && python app.py
   # Test endpoints at http://localhost:5001/api/
   ```

3. **Verify Environment Variables**:
   ```bash
   vercel env ls
   ```

## Production Considerations 🚀

### Database Upgrade
The current SQLite setup resets on each deployment. For production:

1. **Vercel KV** (Redis-based):
   ```bash
   vercel kv create doggiechef-db
   ```

2. **External PostgreSQL**:
   - [PlanetScale](https://planetscale.com)
   - [Supabase](https://supabase.com)
   - [Neon](https://neon.tech)

### Performance Optimization

1. **Image Optimization**:
   - Cloudinary automatically optimizes images
   - Use Cloudinary transformations for responsive images

2. **Caching**:
   - Vercel automatically caches static assets
   - Consider Redis for API response caching

3. **Monitoring**:
   - Use Vercel Analytics
   - Set up error tracking (Sentry)

## Security Checklist 🔒

1. **Environment Variables**:
   - ✅ Never commit secrets to git
   - ✅ Use Vercel environment variables
   - ✅ Rotate API keys regularly

2. **API Security**:
   - ✅ CORS is configured
   - ✅ Input validation in place
   - ✅ Rate limiting (consider adding)

3. **Image Upload**:
   - ✅ File type validation
   - ✅ File size limits
   - ✅ Cloudinary handles security

## Next Steps 🎯

After successful deployment:

1. **Custom Domain**: Set up your own domain
2. **Authentication**: Add user accounts
3. **Database**: Upgrade to persistent storage
4. **Monitoring**: Set up analytics and error tracking
5. **SEO**: Add meta tags and sitemap
6. **PWA**: Make it installable on mobile devices

## Support 💬

If you encounter issues:

1. Check the [Vercel documentation](https://vercel.com/docs)
2. Review [Cloudinary documentation](https://cloudinary.com/documentation)
3. Open an issue in the GitHub repository

Your DoggieChef website is now live and ready to collect delicious recipes! 🍳✨ 