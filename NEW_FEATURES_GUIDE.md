# Quick Guide - New Features

## 🎀 Female-Only Carpool

### Where to Find It
**Profile Screen** → Logged in → "Matching preferences" section

### How It Works

```
┌─────────────────────────────────┐
│ Profile                         │
├─────────────────────────────────┤
│        👤                        │
│       JD                         │
│    Jane Doe                     │
│    jane@gmail.com               │
│    4.8 ★                        │
├─────────────────────────────────┤
│ Matching preferences            │ ← NEW SECTION
│                                 │
│ Female-only carpool    [Toggle] │ ← TOGGLE HERE
│                                 │
│ When enabled, your matches will │
│ only include female riders/     │
│ drivers where possible.         │
│ Otherwise, mixed is fine.       │
└─────────────────────────────────┘
```

### What Happens When Enabled

**In Ride Flow**:
```
┌─────────────────────────────────┐
│ Book your ride                  │
├─────────────────────────────────┤
│ Pickup: Dubai Marina            │
│ Dropoff: DIFC                   │
│ Earliest: 08:00                 │
│ Latest: 08:30                   │
│                                 │
│ Suggested: 15 AED               │
│ Demand: High (8.5 / 10)         │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ This ride will be matched   │ │ ← NEW BADGE
│ │ as female-only              │ │
│ └─────────────────────────────┘ │
│                                 │
│    [Request ride]               │
└─────────────────────────────────┘
```

### User Flow
1. **Login** → Profile screen
2. **Scroll down** → Find "Matching preferences"
3. **Toggle switch** → Enable female-only
4. **Auto-saves** → Preference stored
5. **Go to Ride Flow** → Badge appears
6. **Submit ride** → Includes `femaleOnly: true` in payload

### Technical Details
- Stored in AsyncStorage
- Persists across app restarts
- Included in all ride requests/offers
- Backend can filter matches accordingly

---

## 🅿️ Parking Feature

### Where to Find It
**Home Screen** → "Need" or "Offer" section → Parking buttons

### Complete Flow

#### 1. From Home Screen
```
┌─────────────────────────────────┐
│ Carpool UAE                     │
│ Offer or find rides and parking│
├─────────────────────────────────┤
│ Need                            │
│ Book a ride or parking spot     │
│                                 │
│ [Book ride]                     │
│ [Book parking spot]  ← TAP HERE │
├─────────────────────────────────┤
│ Offer                           │
│ Share your ride or rent parking │
│                                 │
│ [Offer ride]                    │
│ [Offer parking space] ← OR HERE │
└─────────────────────────────────┘
```

#### 2. Parking Flow Screen
```
┌─────────────────────────────────┐
│ ← Parking                       │
├─────────────────────────────────┤
│ Find a parking spot             │ ← Title (mode-specific)
│                                 │
│ 📍 Location                     │
│    Business Bay Tower A         │ ← Tap to open map
│                                 │
│ Need spot from – to             │
│ ┌──────────┐  ┌──────────┐     │
│ │ 09:00 🕐 │  │ 17:00 🕐 │     │ ← Native pickers
│ └──────────┘  └──────────┘     │
│                                 │
│ Add price (AED) – optional      │
│ ┌─────────────────────────────┐ │
│ │ 15                          │ │ ← Optional price
│ └─────────────────────────────┘ │
│                                 │
│ Expected booking probability:   │
│ 82%                             │ ← AI insight
│ AI-generated insight            │
│                                 │
│    [Search parking spots]       │ ← Submit
└─────────────────────────────────┘
```

#### 3. Map Selection
```
Tap location row →

┌─────────────────────────────────┐
│ ← Select parking location       │
├─────────────────────────────────┤
│                                 │
│         🗺️ MAP VIEW             │
│                                 │
│            📍                   │ ← Center pin
│                                 │
│         (drag to move)          │
│                                 │
├─────────────────────────────────┤
│ 🔍 Search address...            │
│                                 │
│ 25.2048, 55.2708                │ ← Current coords
│                                 │
│    [Confirm]                    │
└─────────────────────────────────┘
```

### Booking Probability Explained

The AI calculates probability based on:

**Factors**:
- ⏰ **Time window**: Longer = Higher probability
- 💰 **Price**: Lower = Higher probability
- 📍 **Location**: Central areas = Higher (mocked)

**Example Calculations**:

```
Scenario 1: Long window, low price
├─ From: 09:00, To: 17:00 (8 hours)
├─ Price: 10 AED
└─ Probability: 85% ✅

Scenario 2: Short window, high price
├─ From: 09:00, To: 11:00 (2 hours)
├─ Price: 25 AED
└─ Probability: 45% ⚠️

Scenario 3: Medium window, free
├─ From: 09:00, To: 14:00 (5 hours)
├─ Price: 0 AED (free)
└─ Probability: 92% ✅✅
```

### Mode Differences

**Need Mode** (Book parking):
- Title: "Find a parking spot"
- Label: "Need spot from – to"
- Button: "Search parking spots"
- Success: "Searching for spots…"

**Offer Mode** (Offer parking):
- Title: "Offer your parking space"
- Label: "Spot available from – to"
- Button: "Publish parking spot"
- Success: "Parking spot published"

### Payload Example

When you submit:
```json
{
  "mode": "need",
  "location": {
    "lat": 25.2048,
    "lng": 55.2708,
    "description": "Business Bay Tower A"
  },
  "availableFrom": "09:00",
  "availableTo": "17:00",
  "priceAED": 15,
  "bookingProbability": 82
}
```

---

## 🎯 Quick Test Scenarios

### Test 1: Female-Only Carpool
1. Open app → Profile
2. Login with Google
3. Scroll to "Matching preferences"
4. Toggle "Female-only carpool" ON
5. Go to Home → "Book ride"
6. Fill ride details
7. ✅ See badge: "This ride will be matched as female-only"
8. Submit → Check console for `femaleOnly: true`

### Test 2: Book Parking
1. Open app → Home
2. Tap "Book parking spot"
3. Tap location row → Map opens
4. Search "Business Bay" → Select suggestion
5. Tap "Confirm" → Returns to form
6. Tap "From" time → Select 09:00
7. Tap "To" time → Select 17:00
8. Enter price: 15
9. ✅ See probability: ~82%
10. Tap "Search parking spots"
11. ✅ See snackbar: "Searching for spots…"

### Test 3: Offer Parking
1. Open app → Home
2. Tap "Offer parking space"
3. Set location via map
4. Set times: 08:00 - 18:00 (10 hours)
5. Leave price empty (free)
6. ✅ See probability: ~95%
7. Tap "Publish parking spot"
8. ✅ See snackbar: "Parking spot published"

### Test 4: Probability Changes
1. In parking flow, set:
   - Location: Any
   - From: 09:00
   - To: 10:00 (1 hour)
   - Price: 30 AED
2. ✅ See low probability: ~35%
3. Change To: 18:00 (9 hours)
4. ✅ See probability increase: ~75%
5. Change Price: 5 AED
6. ✅ See probability increase: ~88%

---

## 🐛 Troubleshooting

### Female-Only Toggle Not Saving
- Check if user is logged in
- Check AsyncStorage in dev tools
- Look for console errors
- Verify `updateFemaleOnlyCarpool` is called

### Badge Not Showing in Ride Flow
- Verify toggle is enabled in Profile
- Check user object has `femaleOnlyCarpool: true`
- Restart app to reload from AsyncStorage
- Check console for user object

### Parking Map Not Opening
- Verify location permissions granted
- Check Google Maps API key is set
- Look for console errors
- Try on physical device (not just simulator)

### Time Pickers Overlapping
- Should be fixed with modal implementation
- Only one picker should show at a time
- If issue persists, check TimePickerInput component

### Booking Probability Shows "Fill details"
- This is correct when form incomplete
- Ensure all fields are filled:
  - Location set
  - Both times selected
  - Price valid (or empty)
- Should show percentage when complete

---

## 📱 Platform Differences

### iOS
- Time picker: Scroll wheel in modal
- Modal has "Cancel" and "Done" buttons
- Smooth animations
- Native feel

### Android
- Time picker: Material Design dialog
- Auto-closes on selection
- Native Android styling
- Centered dialog

### Both Platforms
- Same functionality
- Same data format
- Same validation
- Same payload structure

---

## ✅ Success Criteria

You've successfully tested when:

**Female-Only Carpool**:
- ✅ Toggle appears in Profile
- ✅ Toggle saves preference
- ✅ Badge shows in Ride Flow
- ✅ Payload includes `femaleOnly`
- ✅ Persists after app restart

**Parking Feature**:
- ✅ Both buttons work from Home
- ✅ Map selection works
- ✅ Time pickers work
- ✅ Price validation works
- ✅ Probability calculates correctly
- ✅ Submit button enables/disables properly
- ✅ Payload is complete and correct

---

**Happy Testing!** 🎉

For detailed technical documentation, see [FEATURES.md](./FEATURES.md)
