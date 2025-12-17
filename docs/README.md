# Kelp - AI-Curated Micro-Itineraries

> Turn a vibe into a bookable night out in seconds using conversational AI powered by Yelp.

## 🎯 Project Overview

Kelp is an innovative application that creates personalized micro-itineraries (2-5 stops) for going out, powered by the Yelp AI API. Users describe their mood, constraints, and preferences, and Kelp generates an editable, shareable flow of local businesses.

## 🏗️ Architecture

### Frontend (React + TypeScript + Tailwind)

```
src/
├── pages/
│   ├── Index.tsx        # Marketing landing page
│   ├── App.tsx          # Main planning experience
│   ├── FlowShare.tsx    # Shareable flow view
│   ├── Privacy.tsx      # Privacy policy
│   └── Terms.tsx        # Terms of service
├── components/
│   ├── landing/         # Landing page components
│   │   ├── Navbar.tsx
│   │   ├── HeroSection.tsx
│   │   ├── HeroFlowPreview.tsx
│   │   ├── HowItWorksSection.tsx
│   │   ├── WhyDifferentSection.tsx
│   │   ├── PoweredByYelpSection.tsx
│   │   └── Footer.tsx
│   └── app/             # App page components
│       ├── ScenarioForm.tsx
│       ├── FlowTimeline.tsx
│       ├── FlowSummaryBar.tsx
│       └── ChatPanel.tsx
└── lib/
    └── utils.ts
```

### Backend (Edge Functions - To Be Implemented)

```
supabase/
└── functions/
    ├── create-flow/     # Generate flow from scenario
    ├── update-flow/     # Refine flow via chat
    └── get-flow/        # Retrieve saved flow
```

## 🚀 Features

### Implemented (v1)
- [x] Beautiful dark-themed landing page with animations
- [x] Scenario input form with location, budget, time, vibes
- [x] Interactive flow timeline with stop cards
- [x] Mock flow generation
- [x] Chat panel with quick actions
- [x] Flow sharing (copy link)
- [x] Local flow saving
- [x] Responsive design (mobile/desktop)
- [x] Glassmorphism UI with glow effects

### To Be Implemented (v2)
- [ ] Yelp AI API integration for real flow generation
- [ ] Conversational flow refinement via Yelp AI Chat
- [ ] Database persistence (Lovable Cloud)
- [ ] User authentication (mock → real)
- [ ] Restaurant reservation integration
- [ ] Map view with stop locations
- [ ] Social sharing with preview images

## 🔌 Yelp API Integration

### Required Endpoints

1. **Business Search** - Find businesses matching criteria
2. **AI Chat (v2_ai_chat)** - Conversational AI for recommendations
3. **Business Details** - Get full business info

### API Flow

```
User Input → Edge Function → Yelp AI Chat → Parse Response → Return Flow
```

### Environment Variables Needed

```env
YELP_API_KEY=your_api_key_here
YELP_CLIENT_ID=your_client_id_here
```

## 🎨 Design System

### Colors (HSL)
- **Background**: `222 47% 6%` (Dark navy)
- **Foreground**: `210 40% 96%` (Off-white)
- **Primary**: `174 84% 50%` (Electric teal)
- **Accent**: `320 84% 60%` (Neon magenta)
- **Glass**: `222 47% 11%` (Glassmorphism)

### Typography
- Font: Inter (Google Fonts)
- Headings: Bold, large (up to 64px)
- Body: Regular, comfortable line height

### Effects
- Glassmorphism cards with backdrop blur
- Glow effects on interactive elements
- Smooth Framer Motion animations
- Gradient text for emphasis

## 📝 Development Notes

### Current State
The app currently uses mock data for flow generation. The chat responses are also mocked to demonstrate the conversational refinement flow.

### Next Steps
1. Enable Lovable Cloud for backend
2. Add Yelp API key as secret
3. Create edge function for flow generation
4. Connect chat to Yelp AI Chat API
5. Add database tables for flow persistence

## 📄 License

Built for the Yelp AI Hackathon 2024.
