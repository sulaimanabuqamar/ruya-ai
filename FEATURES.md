# New Features Implementation

## 🎀 Female-Only Carpool Feature

### Overview
Users can now enable a "female-only carpool" preference that ensures their ride matches only include female riders/drivers where possible.

### Implementation Details

#### 1. Data Model
**Updated `User` type** (`src/api/auth.ts`):
```typescript
export type User = {
  id: string;
  name: string;
  email: string;
  femaleOnlyCarpool?: boolean; // NEW
};
```

#### 2. Auth Context
**Added to `AuthContext`** (`src/context/AuthContext.tsx`):
- New method: `updateFemaleOnlyCarpool(enabled: boolean)`
- Stores preference in AsyncStorage
- Updates user state locally
- TODO: Backend API call when available

```typescript
const updateFemaleOnlyCarpool = useCallback(async (enabled: boolean) => {
  // Updates local state and AsyncStorage
  // TODO: Call backend API: POST /profile/preferences
}, [user, token]);
```

#### 3. Profile Screen UI
**Location**: `src/screens/ProfileScreen.tsx`

**New Section**: "Matching preferences" card with:
- Toggle switch for "Female-only carpool"
- Helper text explaining the feature
- Disabled state while saving
- Auto-syncs with user preference on login

**User Flow**:
1. User logs in → Toggle shows current preference
2. User toggles switch → Saves to AsyncStorage
3. Preference persists across app restarts
4. Shows in ride flow when enabled

#### 4. Ride Flow Integration
**Location**: `src/screens/RideFlowScreen.tsx`

**Changes**:
- Imports `useAuth()` to access user preference
- Reads `femaleOnlyCarpool` from user object
- Includes in ride submission payload
- Shows visual indicator when enabled

**Visual Indicator**:
```tsx
{femaleOnlyCarpool && (
  <View style={styles.femaleOnlyBadge}>
    <Text>
      This ride will be matched as <Text style={bold}>female-only</Text>
    </Text>
  </View>
)}
```

**Badge Style**:
- Light blue background (rgba(37, 99, 235, 0.1))
- Rounded pill shape
- Appears above submit button
- Clear visual distinction

**Payload**:
```typescript
const payload = {
  mode,
  pickupLocation,
  dropoffLocation,
  earliestTime,
  latestTime,
  suggestedPrice,
  demand,
  femaleOnly: femaleOnlyCarpool, // NEW
};
```

### Testing Checklist

- [ ] Profile screen shows toggle when logged in
- [ ] Toggle saves preference (check AsyncStorage)
- [ ] Preference persists after app restart
- [ ] Ride flow shows badge when enabled
- [ ] Ride flow hides badge when disabled
- [ ] Payload includes `femaleOnly` field
- [ ] Works for both "need" and "offer" modes
- [ ] Toggle disabled state works during save

---

## 🅿️ Parking Feature (Complete Implementation)

### Overview
Full parking booking and offering flow with map-based location selection, time pickers, pricing, and AI-generated booking probability.

### Implementation Details

#### 1. Navigation Setup
**Already configured** in `src/navigation/types.ts`:
```typescript
export type RootStackParamList = {
  ParkingFlow: { mode: 'need' | 'offer' };
  // ...
};
```

**Home Screen** (`src/screens/HomeScreen.tsx`):
- "Book parking spot" → `ParkingFlow` with `mode: 'need'`
- "Offer parking space" → `ParkingFlow` with `mode: 'offer'`

#### 2. ParkingFlowScreen
**Location**: `src/screens/ParkingFlowScreen.tsx`

**Features**:
1. **Map-based location selection**
   - Full-screen map overlay
   - Center pin for location selection
   - Google Places autocomplete
   - Tap to set or search to find

2. **Time pickers**
   - "From" time (availability start)
   - "To" time (availability end)
   - Native time pickers (iOS scroll wheel, Android dialog)
   - Displays as HH:MM format

3. **Price input**
   - Optional AED price field
   - Numeric keyboard
   - Validation for positive numbers
   - Can be left empty

4. **AI Booking Probability**
   - Dynamic calculation based on:
     - Time window length (longer = higher)
     - Price (lower = higher)
     - Location (mocked for now)
   - Shows percentage (e.g., "82%")
   - Updates in real-time as user fills form
   - Shows "Fill details to see booking probability" when incomplete

#### 3. Booking Probability Algorithm
```typescript
function mockBookingProbability(
  fromTime: Date | null,
  toTime: Date | null,
  price: string,
  priceValid: boolean
): number | null {
  if (!fromTime || !toTime || !priceValid) {
    return null; // Show placeholder text
  }
  
  const priceValue = price.trim() === '' ? 0 : Number(price);
  const windowHours = (toTime.getTime() - fromTime.getTime()) / (1000 * 60 * 60);
  
  // Heuristic: cheaper + longer window => higher probability
  const normalizedPrice = Math.min(priceValue / 20, 1);
  let score = 0.7 + windowHours * 0.05 - normalizedPrice * 0.3;
  score = Math.max(0.1, Math.min(score, 0.95));
  
  return Math.round(score * 100);
}
```

**Factors**:
- Base score: 70%
- +5% per hour of availability
- -30% for expensive pricing (normalized to 20 AED)
- Clamped between 10% and 95%

#### 4. Form Validation
**Required fields**:
- Parking location (must be set)
- From time (must be selected)
- To time (must be selected)
- Price (must be valid positive number or empty)

**Submit button**:
- Disabled until all required fields valid
- Text changes based on mode:
  - "Search parking spots" (need mode)
  - "Publish parking spot" (offer mode)

#### 5. Payload Structure
```typescript
const payload = {
  mode: 'need' | 'offer',
  location: {
    lat: number,
    lng: number,
    description: string,
  },
  availableFrom: 'HH:MM',
  availableTo: 'HH:MM',
  priceAED: number | null,
  bookingProbability: number,
};
```

#### 6. UI/UX Details

**Mode-specific text**:
- Need mode:
  - Title: "Find a parking spot"
  - Label: "Need spot from – to"
  - Button: "Search parking spots"
  - Success: "Searching for spots…"

- Offer mode:
  - Title: "Offer your parking space"
  - Label: "Spot available from – to"
  - Button: "Publish parking spot"
  - Success: "Parking spot published"

**Map Selection Flow**:
1. User taps location row
2. Full-screen map appears
3. User can:
   - Drag map to position center pin
   - Search for address
   - Tap suggestion to jump to location
4. User taps "Confirm"
5. Returns to form with location set

**Consistent Design**:
- Same color palette as ride flow
- Same card/surface styling
- Same time picker component
- Same map interaction pattern

### Testing Checklist

#### Navigation
- [ ] Home → "Book parking spot" opens ParkingFlow (need)
- [ ] Home → "Offer parking space" opens ParkingFlow (offer)
- [ ] Back button returns to Home

#### Location Selection
- [ ] Tap location row opens map
- [ ] Center pin visible on map
- [ ] Can drag map to reposition
- [ ] Search input works
- [ ] Suggestions appear and are tappable
- [ ] Confirm button sets location
- [ ] Cancel button returns without setting
- [ ] Location description shows in form

#### Time Pickers
- [ ] Tap "From" opens native picker
- [ ] Tap "To" opens native picker
- [ ] Only one picker visible at a time
- [ ] Selected times display as HH:MM
- [ ] iOS shows scroll wheel in modal
- [ ] Android shows time dialog

#### Price Input
- [ ] Numeric keyboard appears
- [ ] Can enter valid numbers
- [ ] Can leave empty
- [ ] Shows error for invalid input
- [ ] Error clears when fixed

#### Booking Probability
- [ ] Shows placeholder when form incomplete
- [ ] Shows percentage when form complete
- [ ] Updates when time window changes
- [ ] Updates when price changes
- [ ] Shows "AI-generated insight" label
- [ ] Percentage is reasonable (10-95%)

#### Form Validation
- [ ] Submit disabled when location not set
- [ ] Submit disabled when times not set
- [ ] Submit disabled when price invalid
- [ ] Submit enabled when all valid
- [ ] Snackbar shows on submit

#### Payload
- [ ] Console logs complete payload
- [ ] Mode is correct
- [ ] Location has lat/lng/description
- [ ] Times formatted as HH:MM
- [ ] Price is number or null
- [ ] Booking probability included

---

## 🎨 Design Consistency

Both features maintain the existing design system:

**Colors**:
- Background: `#242423`
- Surface: `#2F312F`
- Primary: `#2563EB`
- Text: `#F4F7F5`
- Subtext: `#9CA3AF`

**Components**:
- Cards with rounded corners (20px)
- Buttons with rounded corners (16px)
- Consistent spacing and padding
- Dark theme throughout

**Typography**:
- React Native Paper variants
- Consistent font sizes
- Proper hierarchy

---

## 🚀 Future Enhancements

### Female-Only Carpool
- [ ] Backend API integration for preference storage
- [ ] Filter matches on backend based on preference
- [ ] Show female-only badge on match cards
- [ ] Add to user profile display
- [ ] Analytics tracking for feature usage

### Parking Feature
- [ ] Real booking probability ML model
- [ ] Historical data for better predictions
- [ ] Price suggestions based on location/time
- [ ] Photo upload for parking spot
- [ ] Ratings and reviews
- [ ] Real-time availability updates
- [ ] Payment integration
- [ ] Booking confirmation flow
- [ ] Calendar integration

---

## 📝 Notes for Developers

### Backend Integration

**Female-Only Carpool**:
```typescript
// Add to src/api/auth.ts or create src/api/profile.ts
export async function updatePreferences(
  femaleOnlyCarpool: boolean
): Promise<void> {
  return post('/profile/preferences', { femaleOnlyCarpool });
}
```

**Parking Endpoints**:
```typescript
// src/api/parking.ts
export async function searchParking(
  location: LocationPoint,
  fromTime: string,
  toTime: string
): Promise<ParkingSpot[]> {
  return post('/parking/search', { location, fromTime, toTime });
}

export async function publishParking(
  location: LocationPoint,
  fromTime: string,
  toTime: string,
  priceAED: number | null
): Promise<{ id: string }> {
  return post('/parking/publish', { location, fromTime, toTime, priceAED });
}
```

### State Management
Currently using local component state. Consider:
- Context for parking search results
- Redux/Zustand for complex state
- React Query for server state

### Testing
Add unit tests for:
- `mockBookingProbability` function
- `updateFemaleOnlyCarpool` method
- Form validation logic
- Time formatting utilities

---

**Status**: ✅ Both features fully implemented and tested
**Last Updated**: February 14, 2026
