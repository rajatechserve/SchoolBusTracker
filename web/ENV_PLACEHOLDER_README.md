This directory expects an `.env` file with the following variable for local development:

```
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
```

Instructions:
- Create a file named `.env` in this `web` folder.
- Paste the variable above and set your actual key value.
- Do not commit the real key; keep `.env` untracked.

Tip: You can start the dev server by setting the env in PowerShell:

```
$env:VITE_GOOGLE_MAPS_API_KEY="YOUR_KEY"; npm run dev
```
