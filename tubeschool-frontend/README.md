# 🎓 TubeSchool Frontend

A beautiful, modern React frontend for TubeSchool - transforming YouTube videos into interactive learning experiences.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Backend API running on `http://localhost:8000`

### Installation

```bash
# Create React app
npx create-react-app tubeschool-frontend
cd tubeschool-frontend

# Install dependencies
npm install react-router-dom framer-motion lucide-react axios
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind
npx tailwindcss init -p
```

### Setup Steps

1. **Replace all files** with the provided components from artifacts

2. **File structure should look like:**
```
src/
├── api/
│   └── tubeschool.js
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   └── Logo.jsx
│   ├── home/
│   │   ├── Hero.jsx
│   │   └── VideoUrlForm.jsx
│   ├── study/
│   │   ├── HeaderBar.jsx
│   │   ├── VideoPanel.jsx
│   │   ├── AvatarPanel.jsx
│   │   ├── ChatPanel.jsx
│   │   └── CourseCompletionModal.jsx
│   └── test/
│       ├── QuizQuestion.jsx
│       └── QuizSummary.jsx
├── screens/
│   ├── HomeScreen.jsx
│   ├── StudyScreen.jsx
│   └── TestScreen.jsx
├── App.jsx
├── index.js
└── index.css
```

3. **Start the development server:**
```bash
npm start
```

The app will open at `http://localhost:3000`

---

## 🎨 Features Implemented

### ✅ Home Screen
- Animated hero section with gradient blobs
- YouTube URL input with validation
- Beautiful dark theme with orange accents

### ✅ Study Screen
- 3-panel layout (Video | Avatar | Chat)
- YouTube player integration with IFrame API
- Real-time Q&A chat with teacher
- Avatar placeholder (ready for HeyGen integration)
- Course completion modal with tabs

### ✅ Test Screen
- Dynamic quiz generation from user doubts
- MCQ and short answer support
- Real-time answer evaluation
- Detailed feedback with scores
- Beautiful result summary

---

## 🔧 Configuration

### API Endpoint

The API base URL is configured in `src/api/tubeschool.js`:

```javascript
const API_BASE_URL = 'http://localhost:8000/api/v1';
```

Change this for production deployment.

### Color Theme

Colors are defined in `tailwind.config.js`:

```javascript
colors: {
  tubes: {
    bg: '#050816',
    accent: '#ff7b3a',
    // ... etc
  }
}
```

---

## 📱 Responsive Design

The app is optimized for desktop but includes responsive breakpoints:
- Mobile: Single column layout
- Tablet: Adjusted panel widths
- Desktop: Full 3-panel layout

---

## 🎯 User Flow

1. **Home** → User pastes YouTube URL
2. **API Call** → `POST /api/v1/sessions`
3. **Study Screen** → Watch video + ask questions
4. **Questions** → `POST /api/v1/sessions/{id}/questions`
5. **Completion Modal** → Choose to take test or download notes
6. **Test Screen** → `GET /api/v1/sessions/{id}/quiz`
7. **Submit** → `POST /api/v1/sessions/{id}/quiz/submit`
8. **Results** → Show score and feedback

---

## 🧩 Component Architecture

### Reusable Components
- `Button` - Primary, secondary, ghost variants
- `Card` - Consistent container styling
- `Input` - Styled text inputs
- `Logo` - Brand identity component

### Screen-Specific Components
- **Home**: `Hero`, `VideoUrlForm`
- **Study**: `HeaderBar`, `VideoPanel`, `AvatarPanel`, `ChatPanel`, `CourseCompletionModal`
- **Test**: `QuizQuestion`, `QuizSummary`

---

## 🎬 YouTube Player Integration

The app uses YouTube IFrame API for:
- Video playback control
- Detecting video end
- Tracking current timestamp for contextual questions

API is loaded dynamically in `VideoPanel.jsx`.

---

## 🔮 Future Enhancements

- [ ] HeyGen avatar integration (placeholder ready)
- [ ] Notes download functionality
- [ ] Session persistence
- [ ] Loading skeletons
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Dark/light mode toggle
- [ ] Analytics tracking

---

## 🐛 Troubleshooting

**Videos not loading:**
- Check if backend is running on `localhost:8000`
- Verify video has captions enabled
- Check browser console for CORS errors

**YouTube player not appearing:**
- YouTube IFrame API requires internet connection
- Check for ad blockers interfering

**Quiz not generating:**
- Must ask at least one question during video
- Check session_id is valid

---

## 🚀 Production Build

```bash
npm run build
```

Deploy the `build` folder to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting

Update API URL in production:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
```

Set environment variable `REACT_APP_API_URL` on your hosting platform.

---

## 📦 Dependencies

```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "framer-motion": "^10.16.5",
  "lucide-react": "^0.294.0",
  "axios": "^1.6.2",
  "tailwindcss": "^3.3.6"
}
```

---

## 🎨 Design System

### Colors
- Background: `#050816`
- Accent: `#ff7b3a` (orange)
- Cards: `#0c1220`
- Borders: `#1f2933`

### Typography
- Font: Inter
- Headings: Bold, large
- Body: Regular, 14-16px

### Spacing
- Consistent use of Tailwind spacing scale
- Cards: `rounded-3xl` with `p-6`
- Buttons: `rounded-2xl`

---

## 💡 Tips

- Use React DevTools to inspect component state
- Check Network tab for API call debugging
- Use Tailwind IntelliSense VSCode extension
- Keep components small and focused

---

## 📞 Support

For issues or questions:
- Check backend is running correctly
- Verify API contract matches implementation
- Test with simple educational videos first

---

Happy coding! 🎉