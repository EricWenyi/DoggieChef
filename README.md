# DoggieChef - 菜谱合集 🍳

A beautiful recipe collection website with cute, minimalist design, now deployable to Vercel!

## Features ✨
- 📝 **CRUD operations** for recipes (Create, Read, Update, Delete)
- 🏷️ **Smart tagging** by country of origin and protein type
- 📸 **Multi-photo upload** with Cloudinary integration
- 🔍 **Advanced filtering** and search functionality
- 📊 **Statistics dashboard** with aggregations
- 📱 **Fully responsive** design for all devices
- 🎨 **Cute orange-themed** minimalist UI
- ☁️ **Vercel deployment** ready

## Tech Stack 🛠️
- **Frontend**: React 18 with modern hooks
- **Backend**: Vercel Serverless Functions (Python)
- **Database**: SQLite (for development), easily upgradeable to PostgreSQL
- **Photo Storage**: Cloudinary cloud storage
- **Deployment**: Vercel

## Quick Start 🚀

### Local Development

#### Option 1: One-Command Setup (Recommended)
```bash
./start.sh
```

#### Option 2: Manual Setup

##### Prerequisites
- Python 3.7+
- Node.js 14+
- npm or yarn

##### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

##### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Vercel Deployment 🌐

#### Prerequisites
1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Cloudinary Account**: Sign up at [cloudinary.com](https://cloudinary.com) for image hosting
3. **Vercel CLI**: Install with `npm i -g vercel`

#### Deployment Steps

1. **Clone and prepare the project**:
   ```bash
   git clone <your-repo>
   cd DoggieChef
   ```

2. **Set up environment variables** in Vercel dashboard:
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

3. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

4. **Or deploy via GitHub**:
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Push to main branch for automatic deployment

#### Environment Variables
```bash
# Cloudinary Configuration (Required for production)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Project Structure 📁
```
DoggieChef/
├── api/                  # Vercel Serverless Functions
│   ├── recipes.py       # Recipe CRUD operations
│   ├── stats.py         # Statistics endpoint
│   ├── filters.py       # Filter options endpoint
│   └── utils.py         # Utility functions
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── App.js       # Main app component
│   │   └── App.css      # Styling
│   └── package.json     # Node.js dependencies
├── backend/             # Local development backend
├── vercel.json          # Vercel configuration
├── requirements.txt     # Python dependencies
├── package.json         # Root package.json
└── README.md           # This file
```

## API Endpoints 🔌

### Recipes
- `GET /api/recipes` - Get all recipes (with optional filters)
- `POST /api/recipes` - Create new recipe

### Statistics
- `GET /api/stats` - Get recipe statistics

### Filters
- `GET /api/filters` - Get available filter options

## Photo Upload 📸
- **Local Development**: Local file system storage
- **Production**: Cloudinary cloud storage
- Supports multiple image formats: JPG, PNG, HEIC, WebP
- Optimized for iPhone uploads
- Automatic unique filename generation

## Database 🗄️
- **Local Development**: SQLite database
- **Production**: SQLite in `/tmp` (resets on deployment)
- **Upgrade Path**: Easy to switch to PostgreSQL or other databases

## Development vs Production 🔄

### Local Development
- Flask backend on port 5001
- React frontend on port 3000
- SQLite database file
- Local file storage for photos

### Production (Vercel)
- Serverless functions for API
- Static React build served by Vercel
- SQLite in `/tmp` (stateless)
- Cloudinary for photo storage

## Deployment Checklist ✅

Before deploying to Vercel:

1. ✅ **Cloudinary Account**: Set up and get API credentials
2. ✅ **Environment Variables**: Add to Vercel dashboard
3. ✅ **Test Locally**: Ensure everything works locally
4. ✅ **Database**: Consider upgrading to persistent database for production
5. ✅ **Domain**: Configure custom domain if needed

## Upgrading for Production 🚀

For a production-ready deployment, consider:

1. **Persistent Database**: 
   - Use Vercel KV (Redis-based)
   - Or external PostgreSQL (PlanetScale, Supabase)

2. **Authentication**:
   - Add user authentication
   - Implement user-specific recipes

3. **Advanced Features**:
   - Recipe sharing
   - Recipe ratings and reviews
   - Recipe categories and tags

4. **Performance**:
   - Image optimization
   - Caching strategies
   - CDN for static assets

## Contributing 🤝
Feel free to contribute by:
- Adding new features
- Improving the UI/UX
- Fixing bugs
- Adding more recipe categories
- Enhancing the deployment process

## License 📄
This project is open source and available under the MIT License. 