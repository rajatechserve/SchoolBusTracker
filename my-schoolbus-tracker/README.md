# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Bus Tracking (WebView + Google Maps)

The parent `TrackBus` screen now uses a WebView (`react-native-webview`) that loads `map-template.html` to render a Google Map with:
- Live bus marker (smooth animated transitions)
- Custom SVG bus and school icons
- Polyline of travelled path
- Fit / center controls (Bus, School, All)
- Message bridge (`postMessage`) between React Native and the HTML

Polling every 5s hits `GET /buses` (see `api.ts`) and posts location updates to the WebView. The driver app posts location updates to `POST /buses/:id/location`.

### Setup Requirements
1. Obtain a Google Maps JavaScript API key and enable Maps + Geometry libraries.
2. Edit `app/screens/Parent/map-template.html` and replace `YOUR_GOOGLE_MAPS_API_KEY` with your key.
3. (Expo) If key changes frequently, consider injecting it via string replacement instead of hardcoding.

### Customization
- School coordinates: Currently hardcoded in `TrackBus.tsx` (Chennai sample). Replace with real school lat/lng or fetch from API.
- Polling interval: Adjust the `setInterval` (5000 ms) in `TrackBus.tsx`.
- Route length cap: Last 200 points preserved; change the slice logic if needed.

### Notes
- Local HTML is bundled via `require('./map-template.html')`.
- Add any additional commands (e.g., clearing route) by posting `{ type: 'CLEAR_ROUTE' }`.
- For production, restrict API key domain and consider obfuscating key distribution.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
