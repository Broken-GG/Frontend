# 🎮 BrokenGG - League of Legends Match Tracker

[![CI/CD Integration](https://github.com/Broken-GG/Frontend/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Broken-GG/Frontend/actions)

A modern, clean web application for tracking League of Legends match history, player statistics, and performance analytics.

## 📁 Project Structure

```
Frontend/
├── src/
│   ├── js/
│   │   ├── api/
│   │   │   └── ApiService.js          # Centralized API service
│   │   ├── components/
│   │   │   └── MatchCard.js           # Match card component
│   │   ├── config/
│   │   │   └── config.js              # App configuration (env-aware)
│   │   ├── pages/
│   │   │   ├── home/
│   │   │   │   └── Home.js            # Home page logic
│   │   │   └── profile/
│   │   │       ├── Profile.js         # Profile page main
│   │   │       ├── MatchDisplayManager.js  # Match display logic
│   │   │       └── SidebarInfo.js     # Sidebar components
│   │   ├── services/
│   │   │   ├── DataDragonService.js   # Data Dragon API
│   │   │   └── AugmentsService.js     # Arena augments
│   │   └── utils/
│   │       ├── logger.js              # Environment-aware logging
│   │       └── errorHandler.js        # Centralized error handling
│   ├── styles/                        # CSS files
│   └── pages/
│       └── user.html                  # User profile page
├── public/                            # Static assets only
├── index.html                         # Home page
├── package.json                       # Dependencies and scripts
├── vite.config.js                     # Vite build configuration
├── .env.example                       # Environment variables template
├── Dockerfile                         # Multi-stage Docker build
├── docker-compose.yml                 # Docker Compose config
├── nginx.conf                         # Nginx configuration
└── server.py                          # Development server (Python fallback)
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** or **yarn**
- Modern web browser
- Backend API running (see Backend README)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Broken-GG/Frontend.git
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

### Alternative Development Servers

**Using Python (Simple HTTP Server):**
```bash
npm run serve
# or
python server.py
```

**Using Vite Preview (after build):**
```bash
npm run build
npm run preview
```

## 📦 Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

Build output will be in the `dist/` directory.

## 🐳 Docker

### Build and Run
```bash
docker build -t brokengg-frontend .
docker run -p 80:80 brokengg-frontend
```

### Using Docker Compose
```bash
docker-compose up -d
```

### Run
```bash
docker run -p 80:80 brokengg-frontend
```

Access at `http://localhost`

## 📁 File Descriptions

### HTML Pages

#### `index.html` - Home Page
- Summoner search interface
- Input validation
- Error handling
- Examples of valid summoner names

#### `pages/user.html` - Profile Page
- Summoner information display
- Match history with pagination
- Ranked information sidebar
- Champion mastery display

### JavaScript Modules

#### `HomePage/index.js`
- Search form handling
- URL parameter parsing
- Input validation (Name#Tag format)
- Navigation to profile page

#### `UserProfile/user.js`
- **UserPageService class**: API communication
- **DOMUtils class**: DOM manipulation helpers
- Profile data loading and display
- URL parameter handling
- Image fallback logic

#### `UserProfile/MatchHistory.js`
- **MatchDisplayManager class**: Match rendering
- Match card creation
- "Load More" functionality
- Win/loss statistics
- Team composition display
- Champion, item, and spell icons

#### `UserProfile/SideBarInfo.js`
- Ranked information display
- Champion mastery display
- Tier and division badges
- Mastery level indicators

### Stylesheets

#### `main.css`
- Global styles
- CSS variables for theming
- Typography
- Layout utilities

#### `search.css`
- Search page specific styles
- Form styling
- Button animations
- Error message styling

#### `UserProfile/*.css`
- `user.css`: Profile header styles
- `user-profile.css`: Overall profile layout
- `match-history.css`: Match card styling

## 🎨 Styling Guide

### CSS Architecture
- Component-based styling
- CSS custom properties (variables) for theming
- Mobile-first responsive design
- BEM-like naming conventions

### Color Scheme
```css
:root {
  --primary-color: #5383e8;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --background-dark: #0a1428;
  --background-light: #162038;
}
```

## 📱 Responsive Design

The application is responsive and works on:
- Desktop (1920px+)
- Laptop (1366px - 1920px)
- Tablet (768px - 1366px)
- Mobile (320px - 768px)

## 🔄 Data Flow

```
User Input → Search Form → API Request → Backend
                ↓
Backend Response → Parse Data → Update DOM → Display
```

### API Integration

1. **Search Summoner**
   - User enters Name#Tag
   - Frontend validates format
   - Calls `/api/SummonerInfo/{name}/{tag}`
   - Redirects to profile with data

2. **Load Profile**
   - Fetches summoner info
   - Loads match history (paginated)
   - Fetches ranked data
   - Fetches mastery data
   - All data rendered dynamically

3. **Load More Matches**
   - Infinite scroll pattern
   - Fetches next 20 matches
   - Appends to existing display
   - Updates statistics

## 🎯 Features

### Implemented
✅ Summoner search with validation
✅ Profile information display
✅ Match history with detailed stats
✅ Win/loss indicators
✅ Champion icons and images
✅ Item and summoner spell icons
✅ Ranked information display
✅ Champion mastery display
✅ Pagination (load more)
✅ Error handling and fallbacks
✅ Responsive design

### Planned
- [ ] Match filtering (by queue type)
- [ ] Statistics graphs and charts
- [ ] Favorite summoners (localStorage)
- [ ] Dark/Light theme toggle
- [ ] Match search/filter
- [ ] Live game tracking
- [ ] Compare summoners
- [ ] Export match history

## 🔍 Code Quality

### Best Practices Used
- **ES6 Modules**: Separated concerns
- **Async/Await**: Clean asynchronous code
- **Classes**: Organized functionality
- **Error Handling**: Try-catch blocks
- **Fallback Logic**: Graceful degradation
- **Constants**: Configuration externalized
- **Comments**: Code documentation

### No Heavy Dependencies
- ✅ Pure JavaScript (no jQuery)
- ✅ No build step required
- ✅ No npm dependencies
- ✅ Fast loading times
- ✅ Easy to understand and maintain

## 🐛 Debugging

### Enable Debug Logging
Console logs are throughout the code. Open browser DevTools (F12) to see:
- API calls and responses
- Data transformations
- Error messages
- Loading states

### Common Issues

**Images not loading?**
- Check Data Dragon version
- Verify champion name spelling
- Check browser console for 404s

**API not responding?**
- Ensure backend is running
- Check CORS configuration
- Verify API URL in config.js

**Match history empty?**
- Verify summoner has recent matches
- Check console for API errors
- Ensure correct region

## 🚀 Performance

### Optimizations
- Image lazy loading (browser native)
- Minimal JavaScript payload
- Cached API responses (5 minutes)
- Nginx gzip compression (Docker)
- Static asset caching (1 year)

### Lighthouse Scores (Target)
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

## 🔐 Security

### Implemented
- XSS protection headers (nginx)
- Input sanitization
- CORS handling
- No sensitive data in frontend
- PUUID kept server-side

### Recommendations
- Use HTTPS in production
- Implement Content Security Policy
- Add rate limiting on forms
- Sanitize all user inputs

## 🤝 Contributing

### Code Style
- Use ES6+ features
- 2-space indentation
- Semicolons required
- camelCase for variables
- PascalCase for classes
- Descriptive variable names

### Adding New Features
1. Create new module in appropriate folder
2. Export functions/classes
3. Import where needed
4. Update this README
5. Test in multiple browsers

## 📚 Resources

- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Riot Data Dragon](https://developer.riotgames.com/docs/lol#data-dragon)
- [CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)

## 📝 Notes

- All times displayed in user's local timezone
- Champion images from Riot Data Dragon CDN
- Fallback images for missing assets
- Mobile-optimized touch targets
- Keyboard navigation support

---

Keep the frontend simple, fast, and focused on user experience! 🎮
