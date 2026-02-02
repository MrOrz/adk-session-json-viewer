<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/18J8nE5FVLTKL0wdtTfgPNrNj4Xl9nmfp

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `pnpm i`
2. Run the app:
   `pnpm dev`

## Google Drive Integration

To enable loading files from Google Drive using the Google Picker API, you need to configure the following environment variables:

- `GOOGLE_API_KEY`: Your Google Cloud API Key.
- `GOOGLE_CLIENT_ID`: Your Google Cloud OAuth 2.0 Client ID (Web Application).
- `GOOGLE_APP_ID`: Your Google Cloud Project Number.

### Setup Instructions

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project or select an existing one.
3.  **Enable APIs**: Enable the **Google Picker API** and **Google Drive API**.
4.  **Credentials**:
    *   Create an **API Key**.
    *   Create an **OAuth 2.0 Client ID** for a **Web application**. Add your app's origin (e.g., `http://localhost:3000` or your GitHub Pages URL) to the **Authorized JavaScript origins**.
5.  **Project Number**: Find your project number in the Project Settings.

### Local Development

Create a `.env` file in the root directory and add your credentials:

```env
GOOGLE_API_KEY=your_api_key
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_APP_ID=your_project_number
```

### Deployment

Add these values as GitHub Action Secrets: `GOOGLE_API_KEY`, `GOOGLE_CLIENT_ID`, and `GOOGLE_APP_ID`. They will be injected into the build process automatically.
