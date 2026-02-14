# Carpool Agents - React Native App

A modern carpooling app built with React Native, Expo, and TypeScript featuring native time pickers and Google OAuth authentication.

## 🎉 Recent Major Updates

### ✅ Native Time Pickers
All time inputs now use native OS pickers instead of text fields:
- **iOS**: Beautiful scroll wheel picker
- **Android**: Native time dialog
- **Format**: HH:MM display
- **Validation**: Built-in, no manual entry errors

### ✅ Google OAuth Sign-In
Replaced email/password signup with Google authentication:
- **Primary**: "Continue with Google" button
- **Fallback**: Email login for existing users
- **Seamless**: Handles both signup and login
- **Persistent**: Credentials stored in AsyncStorage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Google Cloud Console account (for OAuth)

### Installation

```bash
# Navigate to project
cd carpool-agents

# Install dependencies (if not already done)
npm install

# Start the development server
npm start
```

### Running on Devices

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web
```

## 🔧 Configuration

### 1. Google OAuth Setup (Required)

See [SETUP.md](./SETUP.md) for detailed instructions.

Quick steps:
1. Create project in [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials (Web, iOS, Android)
3. Copy `.env.example` to `.env`
4. Add your Client IDs to `.env`

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 2. Environment Variables

Required variables in `.env`:

```env
# Google OAuth (get from Google Cloud Console)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id

# Google Maps (for location search)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-api-key

# Backend API (optional)
EXPO_PUBLIC_API_BASE_URL=https://your-api.com
```

## 📱 Features

### Ride Flow
- **Pickup/Dropoff**: Interactive map with location search
- **Departure Window**: Native time pickers for earliest/latest times
- **AI Insights**: Suggested pricing and demand estimation
- **Validation**: Form disabled until all required fields filled

### Parking Flow
- **Location**: Map-based parking spot selection
- **Availability**: Native time pickers for from/to times
- **Pricing**: Optional price input with validation
- **AI Insights**: Booking probability estimation

### Profile & Auth
- **Google Sign-In**: One-tap authentication
- **Email Login**: Fallback for existing users
- **Profile**: Avatar, name, email, rating display
- **Preferences**: Female-only carpool toggle
- **History**: Past rides and parking bookings
- **Persistence**: Auto-login on app restart

## 🏗️ Project Structure

```
carpool-agents/
├── src/
│   ├── api/              # API client and endpoints
│   │   ├── auth.ts       # Authentication API
│   │   ├── client.ts     # HTTP client
│   │   └── maps.ts       # Google Maps API
│   ├── components/       # Reusable components
│   │   ├── ScreenContainer.tsx
│   │   └── TimePickerInput.tsx  # ⭐ New time picker
│   ├── config/           # Configuration
│   │   ├── googleAuth.ts # ⭐ Google OAuth config
│   │   └── maps.ts       # Maps configuration
│   ├── context/          # React Context
│   │   └── AuthContext.tsx  # ⭐ Updated with Google auth
│   ├── navigation/       # Navigation types
│   ├── screens/          # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── ProfileScreen.tsx      # ⭐ Updated UI
│   │   ├── RideFlowScreen.tsx     # ⭐ Time pickers
│   │   ├── ParkingFlowScreen.tsx  # ⭐ Time pickers
│   │   ├── AIInternalsScreen.tsx
│   │   └── ...
│   ├── theme/            # Theme configuration
│   └── utils/            # Utility functions
│       ├── time.ts       # ⭐ Time formatting
│       └── validation.ts # Form validation
├── assets/               # Images and icons
├── .env.example          # ⭐ Environment template
├── app.json              # ⭐ Updated Expo config
├── App.tsx               # Root component
├── package.json          # Dependencies
├── SETUP.md              # ⭐ Detailed setup guide
├── CHANGES.md            # ⭐ Implementation details
└── README.md             # This file
```

⭐ = New or significantly updated

## 🧪 Testing

### Time Pickers
1. Open Ride Flow or Parking Flow
2. Tap any time field
3. Verify native picker appears
4. Select a time
5. Verify HH:MM format displays
6. Test on both iOS and Android

### Google Sign-In
1. Open Profile screen
2. Tap "Continue with Google"
3. Complete Google authentication
4. Verify profile displays correctly
5. Close and reopen app
6. Verify auto-login works
7. Test logout

### Email Login (Fallback)
1. Open Profile screen
2. Enter email and password
3. Tap "Log in with Email"
4. Verify login works (if backend configured)

## 🔍 Troubleshooting

### Google Sign-In Issues
- **Not opening**: Check Client IDs in `.env`
- **Invalid redirect**: Verify redirect URI in Google Console
- **iOS not working**: Ensure iOS Client ID is correct
- **Android not working**: Verify SHA-1 fingerprint

### Time Picker Issues
- **Not showing**: Ensure `@react-native-community/datetimepicker` installed
- **Crashes**: Run `npx expo prebuild` if using bare workflow

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start --clear
```

## 📚 Documentation

- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [CHANGES.md](./CHANGES.md) - Implementation details
- [Expo Docs](https://docs.expo.dev/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)

## 🛠️ Tech Stack

- **Framework**: React Native + Expo SDK 54
- **Language**: TypeScript
- **UI Library**: React Native Paper
- **Navigation**: React Navigation
- **Maps**: React Native Maps + Google Maps API
- **Auth**: Expo Auth Session + Google OAuth
- **Storage**: AsyncStorage
- **Time Pickers**: @react-native-community/datetimepicker

## 📦 Key Dependencies

```json
{
  "@react-native-community/datetimepicker": "^8.x",
  "expo-auth-session": "~6.x",
  "expo-web-browser": "~14.x",
  "react-native-paper": "^5.15.0",
  "react-native-maps": "^1.x",
  "@react-navigation/native": "^7.x"
}
```

## 🚧 Known Limitations

1. **Email Signup**: Removed due to backend 405 errors
2. **Backend Integration**: Currently stores Google token directly (see SETUP.md for backend integration)
3. **Offline Mode**: Not implemented yet
4. **Push Notifications**: Not configured

## 🔮 Future Enhancements

- [ ] Backend token verification
- [ ] Real-time ride matching
- [ ] Push notifications
- [ ] Offline support
- [ ] Payment integration
- [ ] Chat between riders
- [ ] Rating system
- [ ] Trip history with details

## 📄 License

Private project - All rights reserved

## 👥 Support

For issues or questions:
1. Check [SETUP.md](./SETUP.md) for configuration help
2. Review [CHANGES.md](./CHANGES.md) for implementation details
3. Check Expo documentation
4. Review Google OAuth setup guide

---

**Ready to ride!** 🚗💨
