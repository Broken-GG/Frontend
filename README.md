# 🎮 Frontend - Broken.GG Web Client

[![CI/CD Pipeline](https://github.com/Broken-GG/Frontend/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Broken-GG/Frontend/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Modern, type-safe web client for League of Legends match history tracking, built with TypeScript and Vite.

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

## 🚀 Quick Start

### Prerequisites

| Requirement | Version | Required |
|------------|---------|----------|
| **Node.js** | >= 18.0 | ✅ |
| **npm** | >= 9.0 | ✅ |
| **Backend API** | Running | ✅ |
| Modern Browser | Latest | ✅ |

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
   ```
   
   Edit `.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   🌐 Open http://localhost:3000

### Development Commands

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

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

## ✨ Features

### Core Features
- ✅ **Summoner Search** - Name#Tag validation
- ✅ **Profile Display** - Level, rank, mastery
- ✅ **Match History** - Detailed game stats
- ✅ **Win/Loss Tracking** - Visual indicators
- ✅ **Champion Data** - Icons and images
- ✅ **Item Display** - Item builds per game
- ✅ **Ranked Info** - All queue types
- ✅ **Mastery Points** - Top champions
- ✅ **Pagination** - Infinite scroll
- ✅ **Error Handling** - Graceful fallbacks
- ✅ **Responsive** - Mobile-first design
- ✅ **TypeScript** - Type safety

### Technical Features
- ⚡ **Vite Build** - Fast HMR and builds
- 🎨 **Modern CSS** - CSS Grid & Flexbox
- 🔒 **Type Safety** - Full TypeScript coverage
- 📦 **Tree Shaking** - Optimized bundles
- 🖼️ **Lazy Loading** - Images on demand
- 💾 **Caching** - API response caching

### Roadmap
- [ ] Match filtering by queue type
- [ ] Statistics graphs (Chart.js)
- [ ] Favorite summoners (localStorage)
- [ ] Dark/Light theme toggle
- [ ] Live game tracking
- [ ] Compare summoners
- [ ] Export match history (CSV/JSON)
- [ ] PWA support

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

## 🐛 Troubleshooting

<details>
<summary><b>Images not loading</b></summary>

- Check Data Dragon version in console
- Verify champion name spelling
- Check Network tab for 404s
- Clear browser cache

</details>

<details>
<summary><b>API not responding</b></summary>

```bash
# Verify backend is running
curl http://localhost:5000/api/health

# Check CORS in browser console
# Update .env with correct API URL
```

</details>

<details>
<summary><b>Build errors</b></summary>

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

</details>

<details>
<summary><b>TypeScript errors</b></summary>

```bash
# Run type check
npm run type-check

# Update types
npm install --save-dev @types/node
```

</details>

## 🚀 Performance

### Optimizations
- ⚡ Vite's lightning-fast HMR
- 📦 Tree shaking & code splitting
- 🖼️ Native lazy loading for images
- 💾 API response caching (5min)
- 🗜️ Nginx gzip compression
- 🎯 Static asset caching (1 year)
- 🔄 Service worker (planned)

### Lighthouse Targets
- **Performance:** 90+
- **Accessibility:** 95+
- **Best Practices:** 95+
- **SEO:** 90+

## 🔐 Security

### Implemented
- ✅ XSS protection headers
- ✅ Input sanitization
- ✅ CORS configuration
- ✅ No sensitive data in frontend
- ✅ Secure headers (Nginx)

### Production Checklist
- [ ] Enable HTTPS
- [ ] Configure CSP headers
- [ ] Add rate limiting
- [ ] Enable security.txt
- [ ] Set up monitoring

## 🤝 Contributing

### Code Standards

```typescript
// ✅ Good: Type-safe and descriptive
interface SummonerData {
  name: string;
  tagline: string;
  level: number;
}

const getSummoner = async (name: string, tag: string): Promise<SummonerData> => {
  // Implementation
};

// ❌ Bad: Untyped and unclear
const getData = async (n, t) => {
  // Implementation
};
```

### Development Guidelines
- ✅ TypeScript for all new code
- ✅ 2-space indentation
- ✅ Semicolons required
- ✅ camelCase for variables
- ✅ PascalCase for classes/interfaces
- ✅ Descriptive naming
- ✅ JSDoc comments

### Pull Request Process

1. Fork & create feature branch
2. Make changes with type safety
3. Run checks: `npm run type-check && npm run lint`
4. Commit with conventional commits
5. Push and create PR

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

## 📚 Resources

- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Riot Data Dragon](https://developer.riotgames.com/docs/lol#data-dragon)

## 📝 License

MIT License - See [LICENSE](LICENSE) file

## 🙏 Acknowledgments

- Riot Games for Data Dragon API
- Vite team for amazing build tool
- Community contributors

---

<p align="center">Part of <a href="https://github.com/Broken-GG/BrokenGG">Broken.GG</a> project</p>
<p align="center">Built with ❤️ using TypeScript & Vite</p>
