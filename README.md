<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/e90cc170-7cc7-47d5-a718-e292cae73629

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

### Windows one-click launch

1. Double-click [`run-app.bat`](run-app.bat)
2. Keep the window open while the dev server is running
3. Open the local URL shown in the terminal, usually `http://localhost:3000`

### GitHub Pages

This repo now includes a GitHub Actions workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) that builds the Vite app and deploys the `dist` folder to GitHub Pages on every push to `main`.
