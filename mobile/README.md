
School Bus Mobile — Bottom Tabs, role-based visibility (Driver / Parent)

How to run:
1. Ensure global Expo updated:
   npm uninstall -g expo-cli
   npm install -g expo

2. Install project deps:
   cd mobile_project_folder
   rm -rf node_modules package-lock.json
   npm install

3. Start Expo:
   npx expo start --tunnel

Notes:
- Bottom tabs show icons + labels.
- After login as Driver, you'll see Home / Share / Profile tabs.
- After login as Parent, you'll see Home / Track / Profile tabs.
- API base is set for Android emulator: http://10.0.2.2:4000/api
