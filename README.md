# Reflect - Personal Journaling App

A beautiful, AI-powered journaling app built with React Native and Expo that helps you track emotions, identify thinking patterns, and build mental resilience.

## 🌟 Features

- **Smart Journaling**: Write entries with voice-to-text support
- **Emotion analysis**: Detect emotions and cognitive patterns in your writing with or without AI
- **Personalized Activities**: Custom coping strategies for different emotions triggered each time when the emotion is detected
- **Offline Support**: Your data stays private and accessible offline

## 📱 Getting Started on Your Phone

### Option 1: Expo Go (Quick Testing)
1. Install [Expo Go](https://expo.dev/client) on your phone
2. Run `npm run dev` in this project
3. Scan the QR code with Expo Go
4. **Note**: Data will be temporary and reset when you close the app

### Option 2: Development Build (Recommended for Personal Use)
1. Install [EAS CLI](https://docs.expo.dev/build/setup/):
   ```bash
   npm install -g eas-cli
   ```

2. Create an Expo account and login:
   ```bash
   eas login
   ```

3. Configure your project:
   ```bash
   eas build:configure
   ```

4. Build for your device:
   ```bash
   # For iOS (requires Apple Developer account)
   eas build --platform ios --profile development
   
   # For Android
   eas build --platform android --profile development
   ```

5. Install the built app on your device
6. **Your data will persist** between app sessions

### Option 3: Production Build (Best Experience)
1. Follow steps 1-3 from Option 2
2. Build production version:
   ```bash
   # For iOS App Store
   eas build --platform ios --profile production
   
   # For Android Play Store
   eas build --platform android --profile production
   ```

## 🔧 Environment Setup

Create a `.env` file in the root directory:

```env
# Required: Supabase configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Add Fireworks AI API key for enhanced AI analysis
EXPO_PUBLIC_FIREWORKS_API_KEY=your_api_key_here

# Optional: Add Deepgram API key for voice transcription
EXPO_PUBLIC_DEEPGRAM_KEY=your_deepgram_api_key_here

# Optional: Add Hugging Face API key for additional AI features
EXPO_PUBLIC_HUGGING_FACE_API_KEY=your_hugging_face_api_key_here

# The app works perfectly without optional keys - it uses smart fallback analysis
```

### API Keys Setup

#### Deepgram (Voice Transcription)
1. Sign up at [Deepgram](https://deepgram.com/)
2. Get your API key from the dashboard
3. Add it to your `.env` file as `EXPO_PUBLIC_DEEPGRAM_KEY`
4. **Note**: Voice transcription will be disabled if this key is not provided

#### Fireworks AI (Enhanced Analysis)
1. Sign up at [Fireworks AI](https://fireworks.ai/)
2. Get your API key
3. Add it to your `.env` file as `EXPO_PUBLIC_FIREWORKS_API_KEY`

#### Hugging Face (Additional AI Features)
1. Sign up at [Hugging Face](https://huggingface.co/)
2. Get your API key
3. Add it to your `.env` file as `EXPO_PUBLIC_HUGGING_FACE_API_KEY`

## 📊 Data Storage

Your journal entries and personal data are stored locally on your device using:
- **AsyncStorage**: For user preferences and settings
- **React Context**: For app state management
- **Local SQLite** (future enhancement): For advanced data querying

### Data Privacy
- All your journal entries stay on YOUR device
- No data is sent to external servers (except optional AI analysis)
- You control your data completely

## 🚀 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for web
npm run build:web
```

## 📁 Project Structure

```
app/                    # App routes and screens
├── (tabs)/            # Main tab navigation
├── onboarding/        # First-time setup
└── new-entry.tsx      # Journal entry editor

components/            # Reusable UI components
├── AIAnalysisModal.tsx
├── EmotionChart.tsx
├── HealingStrengthChart.tsx
└── ...

contexts/              # App state management
├── EntriesContext.tsx # Journal entries
├── OnboardingContext.tsx # User setup
└── ThemeContext.tsx   # Dark/light theme

services/              # Business logic
├── ai/               # AI analysis modules
├── aiService.ts      # Main AI service
├── speechService.ts  # Voice recognition
└── deepgramService.ts # Voice transcription
```

## 🎨 Customization

### Themes
The app supports both light and dark themes. Customize colors in `contexts/ThemeContext.tsx`.

### AI Analysis
- Works offline with smart pattern detection
- Optional: Add Fireworks AI API key for enhanced analysis
- Fallback: Uses local algorithms for emotion and pattern detection

### Voice Features
- Optional: Add Deepgram API key for voice transcription
- Fallback: Uses device's built-in speech recognition when available

### Activities
Customize coping activities in the onboarding flow or profile settings.

## 🆘 Crisis Support

The app includes built-in crisis support resources:
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- Additional mental health resources

## 🔒 Privacy & Security

- **Local-first**: All data stored on your device
- **No tracking**: No analytics or user tracking
- **Open source**: You can review all code
- **Offline capable**: Works without internet connection

## 📱 System Requirements

- **iOS**: 13.0 or later
- **Android**: API level 21 (Android 5.0) or later
- **Storage**: ~50MB for app + your journal data

## 🤝 Contributing

This is a personal journaling app, but if you'd like to contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - Feel free to use this code for your own personal journaling app.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/) and [React Native](https://reactnative.dev/)
- Icons by [Lucide](https://lucide.dev/)
- AI analysis powered by [Fireworks AI](https://fireworks.ai/) (optional)
- Voice transcription by [Deepgram](https://deepgram.com/) (optional)

---

**Remember**: This app is designed to support your mental health journey, but it's not a replacement for professional mental health care. If you're experiencing a crisis, please reach out to the crisis resources included in the app or contact emergency services.