# Mobile App Quick Setup Guide

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- Expo CLI (installed automatically with npx)
- iOS Simulator (Mac) or Android Emulator
- Or: Expo Go app on physical device

---

## 📱 Running the Mobile App

### 1. Navigate to Mobile Directory
```bash
cd mobile
```

### 2. Install Dependencies (if needed)
```bash
npm install
```

### 3. Configure API URL

**Option A: Using Environment Variable**
Create `.env` file in the `mobile` directory:
```
EXPO_PUBLIC_API_URL=http://YOUR_SERVER_IP:4000/api
```

**Option B: Using app.json**
Edit `mobile/app.json` and add:
```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "http://YOUR_SERVER_IP:4000/api"
    }
  }
}
```

**For Local Testing:**
- iOS Simulator: `http://localhost:4000/api`
- Android Emulator: `http://10.0.2.2:4000/api`
- Physical Device: `http://YOUR_COMPUTER_IP:4000/api`

### 4. Start the Development Server
```bash
npx expo start
```

### 5. Open in Simulator/Device
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app (physical device)

---

## 🧪 Testing the App

### Test Credentials

**Driver Login:**
- Phone: Any 10-digit number registered in your system
- Example: `1234567890` (if you have a driver with this phone)

**Parent Login:**
- Phone: Any 10-digit number registered in your system
- Example: `9876543210` (if you have a parent with this phone)

### What to Test

#### Driver Dashboard:
1. ✅ Login with driver phone number
2. ✅ Navigate between 3 tabs (Attendance, Assignments, Locations)
3. ✅ Mark students present/absent on Attendance tab
4. ✅ View assignments on Assignments tab
5. ✅ Set pickup/drop locations on Locations tab
6. ✅ Pull to refresh on any tab
7. ✅ Check summary updates after marking attendance

#### Parent Dashboard:
1. ✅ Login with parent phone number
2. ✅ Navigate between 4 tabs (Children, Tracking, Assignments, Attendance)
3. ✅ View children with attendance stats on Children tab
4. ✅ Watch bus locations auto-update on Tracking tab (every 5 sec)
5. ✅ View all assignments on Assignments tab
6. ✅ Check attendance history on Attendance tab
7. ✅ Pull to refresh on any tab

---

## 🎨 UI Features

### Modern Design Elements
- **Tab Navigation**: Clean, underlined tabs with icons
- **Card Layouts**: Material Design inspired cards with shadows
- **Color Coding**: Green for present, red for absent, blue for actions
- **Loading States**: Spinner with text during data fetch
- **Empty States**: Friendly messages when no data
- **Pull to Refresh**: Swipe down to reload data
- **Auto Refresh**: Bus tracking updates automatically

### Responsive Interactions
- **Button States**: Disabled when not valid, enabled when ready
- **Alerts**: User-friendly error messages
- **Status Badges**: Visual indicators for attendance status
- **Form Validation**: Real-time validation feedback

---

## 🔧 Troubleshooting

### Issue: "Network Error"
**Solution:** Check API URL configuration
- Make sure server is running on `http://localhost:4000`
- Use correct IP address for physical devices
- Check firewall settings

### Issue: "No data showing"
**Solution:** Verify backend has data
- Check if driver/parent exists in database
- Verify students, buses, routes are created
- Check assignments are configured

### Issue: "Login failed"
**Solution:** Check authentication
- Verify phone number exists in database
- Check server logs for errors
- Ensure JWT token is being generated

### Issue: "Can't mark attendance"
**Solution:** Check driver permissions
- Verify driver has assignments
- Check students are assigned to driver's buses
- Ensure attendance endpoint allows driver role

### Issue: "Locations not saving"
**Solution:** Check PUT endpoint
- Verify `/api/students/:id` allows drivers to update locations
- Check backend logs for authorization errors
- Ensure location fields exist in database

---

## 📦 Project Structure

```
mobile/
├── app/
│   ├── screens/
│   │   ├── Driver/
│   │   │   ├── DriverDashboard.tsx  ✅ Updated (3 tabs)
│   │   │   └── LocationShare.tsx
│   │   ├── Parent/
│   │   │   ├── ParentDashboard.tsx  ✅ Updated (4 tabs)
│   │   │   └── TrackBus.tsx
│   │   └── Login/
│   │       ├── DriverLogin.tsx      ✅ Updated (phone-only)
│   │       ├── ParentLogin.tsx      ✅ Updated (phone-only)
│   │       └── RoleSelect.tsx
│   ├── context/
│   │   └── AuthContext.tsx          ✅ Updated (with schoolId)
│   └── services/
│       └── api.ts                   ✅ Properly configured
├── app.json
├── package.json
└── MOBILE_APP_UPDATES.md            ✅ Full documentation
```

---

## 🚀 Production Deployment

### Building for Production

**iOS:**
```bash
npx expo build:ios
```

**Android:**
```bash
npx expo build:android
```

### Using EAS Build (Recommended)
```bash
npm install -g eas-cli
eas login
eas build --platform ios
eas build --platform android
```

### Configuration for Production
1. Update API URL to production server
2. Configure proper app icons and splash screens
3. Set up app store listings
4. Configure push notifications (if needed)
5. Test on real devices

---

## 📝 Development Tips

### Hot Reload
- Changes save automatically
- Press `r` to reload manually
- Press `Shift + r` for full reload

### Debugging
- Press `j` to open debugger
- Use `console.log()` for logging
- Check Metro bundler terminal for errors

### Code Style
- TypeScript for type safety
- ESLint configured (warnings can be ignored)
- CSS logical properties suggestions are informational only

### State Management
- React hooks (useState, useEffect)
- AsyncStorage for persistence
- No external state library needed

---

## ✅ Features Implemented

### Authentication
- [x] Phone-only login (10-digit validation)
- [x] JWT token management
- [x] School ID association
- [x] Persistent login (AsyncStorage)
- [x] Logout functionality

### Driver Dashboard
- [x] 3-tab navigation
- [x] Today's attendance marking
- [x] Assignment viewing
- [x] Location management (pickup/drop coordinates)
- [x] Pull to refresh
- [x] Summary statistics

### Parent Dashboard
- [x] 4-tab navigation
- [x] Children list with attendance stats
- [x] Live bus tracking (auto-refresh every 5 sec)
- [x] Assignment viewing
- [x] Attendance history (present month)
- [x] Pull to refresh

### UI/UX
- [x] Modern card-based design
- [x] Semantic color coding
- [x] Loading states
- [x] Empty states
- [x] Error handling
- [x] Responsive layout
- [x] Professional styling

---

## 🆘 Support

### Need Help?
1. Check `MOBILE_APP_UPDATES.md` for detailed documentation
2. Review server logs for API errors
3. Check Metro bundler console for app errors
4. Verify database has proper test data

### Common Commands
```bash
# Clear cache
npx expo start --clear

# Reset project
rm -rf node_modules package-lock.json
npm install

# Check for updates
npx expo upgrade
```

---

## 🎉 You're All Set!

The mobile app now has complete feature parity with the web application. All dashboard features, authentication, and UI enhancements have been successfully implemented with a modern, polished look and feel.

**Happy Testing! 📱✨**
