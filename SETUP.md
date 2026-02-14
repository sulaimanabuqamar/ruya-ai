# Carpool Agents Setup Guide

## Recent Updates

### 1. Native Time Pickers
All time inputs now use native OS time pickers:
- iOS: Scroll wheel picker
- Android: Native time dialog
- Time is displayed in HH:MM format
- No more manual text entry for times

### 2. Google OAuth Sign-In
Replaced email/password signup with Google OAuth:
- Primary authentication method: "Continue with Google"
- Fallback: Email login (if backend supports it)
- Seamless signup and login flow

## Google OAuth Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API

### Step 2: Create OAuth 2.0 Credentials

#### Web Client ID (Required for all platforms)
1. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
2. Application type: "Web application"
3. Authorized redirect URIs: Add your redirect URI
   - For Expo: `https://auth.expo.io/@your-username/carpool-agents`
4. Copy the Client ID

#### iOS Client ID (For iOS builds)
1. Create another OAuth 2.0 Client ID
2. Application type: "iOS"
3. Bundle ID: `com.carpoolagents.app` (or your custom bundle ID)
4. Copy the Client ID

#### Android Client ID (For Android builds)
1. Create another OAuth 2.0 Client ID
2. Application type: "Android"
3. Package name: `com.carpoolagents.app` (or your custom package name)
4. SHA-1 certificate fingerprint: Get from your keystore
   ```bash
   # For debug builds
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
5. Copy the Client ID

### Step 3: Configure Environment Variables

Create a `.env` file in the `carpool-agents` directory:

```bash
# Copy from example
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
EXPO_PUBLIC_API_BASE_URL=https://your-backend-api.com
```

### Step 4: Update app.json (if needed)

The `scheme` is already configured as `carpoolagents`. If you want to customize:

```json
{
  "expo": {
    "scheme": "your-custom-scheme",
    "ios": {
      "bundleIdentifier": "com.yourcompany.app"
    },
    "android": {
      "package": "com.yourcompany.app"
    }
  }
}
```

## Running the App

```bash
# Install dependencies (already done)
npm install

# Start Expo
npm start

# Run on specific platform
npm run ios
npm run android
```

## Testing Google Sign-In

### Development (Expo Go)
Google Sign-In works in Expo Go with proper configuration.

### Production Builds
For production, you'll need to create development or production builds:

```bash
# Development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Production build
eas build --profile production --platform ios
eas build --profile production --platform android
```

## Backend Integration (Optional)

If you want to verify Google tokens on your backend:

1. Update `src/api/auth.ts` to add a Google auth endpoint:

```typescript
export async function googleSignIn(accessToken: string): Promise<AuthResponse> {
  return post<AuthResponse>('/auth/google', { accessToken });
}
```

2. Update `AuthContext.tsx` to call your backend:

```typescript
const signInWithGoogle = useCallback(async () => {
  // ... existing code to get googleAccessToken ...
  
  // Call your backend
  const authResponse = await googleSignIn(googleAccessToken);
  setUser(authResponse.user);
  setToken(authResponse.token);
  await saveAuth(authResponse.user, authResponse.token);
}, [promptAsync]);
```

## Troubleshooting

### Google Sign-In not working
- Verify all Client IDs are correct in `.env`
- Check that redirect URI matches in Google Console
- Ensure Google+ API is enabled
- For Android: Verify SHA-1 fingerprint is correct

### Time Pickers not showing
- Ensure `@react-native-community/datetimepicker` is installed
- Run `npx expo prebuild` if using bare workflow
- Check that the plugin is in `app.json`

### Email login giving 405 error
- This is expected if backend doesn't support email signup
- Use Google Sign-In as primary method
- Update backend to support `/auth/login` endpoint if needed

## File Structure

```
carpool-agents/
├── src/
│   ├── api/
│   │   ├── auth.ts          # Auth API calls
│   │   └── client.ts        # HTTP client
│   ├── components/
│   │   └── TimePickerInput.tsx  # Reusable time picker component
│   ├── config/
│   │   └── googleAuth.ts    # Google OAuth config
│   ├── context/
│   │   └── AuthContext.tsx  # Auth state management
│   ├── screens/
│   │   ├── RideFlowScreen.tsx    # Updated with time pickers
│   │   ├── ParkingFlowScreen.tsx # Updated with time pickers
│   │   └── ProfileScreen.tsx     # Updated with Google Sign-In
│   └── utils/
│       └── time.ts          # Time formatting utilities
├── .env.example             # Environment variables template
├── app.json                 # Expo configuration
└── SETUP.md                 # This file
```

## Next Steps

1. Set up Google OAuth credentials
2. Configure environment variables
3. Test Google Sign-In flow
4. Test time pickers on both iOS and Android
5. (Optional) Integrate with your backend for token verification
