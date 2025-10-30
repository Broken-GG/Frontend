# Frontend - Broken.GG Web Application
[![CI/CD Integration](https://github.com/Broken-GG/Frontend/actions/workflows/integration.yml/badge.svg)](https://github.com/Broken-GG/Frontend/actions)


Static web application for League of Legends match history tracking.

## 🏗 Architecture

### Project Structure
```
Frontend/
├── public/
│   ├── index.html                 # Home page with search
│   ├── src/
│   │   ├── config/
│   │   │   └── config.js         # Configuration (API endpoints)
│   │   ├── js/
│   │   │   ├── HomePage/
│   │   │   │   └── index.js      # Search functionality
│   │   │   └── UserProfile/
│   │   │       ├── user.js       # Main profile logic
│   │   │       ├── MatchHistory.js   # Match display
│   │   │       └── SideBarInfo.js    # Ranked/Mastery display
│   │   ├── pages/
│   │   │   └── user.html         # User profile page
│   │   └── styles/
│   │       ├── main.css          # Global styles
│   │       ├── search.css        # Search page styles
│   │       └── UserProfile/      # Profile page styles
│   └── server.py                 # Development server (Python)
├── Dockerfile                     # Production container
├── nginx.conf                     # Nginx configuration
├── package.json                   # Project metadata
└── README.md                      # This file
```

## 🔧 Technologies

- **HTML5** - Semantic markup
- **CSS3** - Modern styling (Grid, Flexbox)
- **JavaScript ES6+** - Modules, async/await
- **Nginx** - Production web server (in Docker)

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Backend API running (see Backend README)
- Optional: Python 3 or Node.js for development server

### Development Setup

1. **Navigate to Frontend folder**
   ```bash
   cd Frontend
   ```

2. **Option 1: Python Server** (Recommended for development)
   ```bash
   python server.py
   ```
   Or:
   ```bash
   python -m http.server 8000 --directory public
   ```

3. **Option 2: Node.js Server**
   ```bash
   npx serve public -p 8000
   ```

4. **Option 3: PHP Server**
   ```bash
   php -S localhost:8000 -t public
   ```

5. **Open in browser**
   ```
   http://localhost:8000
   ```

### Configuration

Update API endpoint in `public/src/config/config.js` if needed:

```javascript
const CONFIG = {
  API: {
    BASE_URL: 'http://localhost:5000/api',
    FALLBACK_URL: 'https://localhost:5001/api',
  }
};
```

## 🐳 Docker

### Build
```bash
docker build -t brokengg-frontend .
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
