# Google Maps API Setup Guide

## 🗺️ **Getting Your Google Maps API Key**

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing (required for API usage)

### Step 2: Enable Required APIs
Enable these APIs in your Google Cloud Console:
- **Maps JavaScript API**
- **Places API**
- **Geocoding API**
- **Directions API**

### Step 3: Create API Key
1. Go to "Credentials" in the Google Cloud Console
2. Click "Create Credentials" → "API Key"
3. Copy your API key

### Step 4: Restrict Your API Key (Recommended)
1. Click on your API key to edit it
2. Under "Application restrictions", select "HTTP referrers"
3. Add your domain (e.g., `localhost:3000/*` for development)
4. Under "API restrictions", select "Restrict key"
5. Select the APIs you enabled in Step 2

## 🔧 **Update Your Application**

### Step 1: Update the Configuration
Open `src/config.ts` and replace the placeholder with your actual API key:

```typescript
export const config = {
  google: {
    apiKey: 'YOUR_ACTUAL_GOOGLE_MAPS_API_KEY_HERE',
    libraries: ['places', 'geometry'],
  },
  // ... rest of config
};
```

### Step 2: Test the Application
1. Start the development server: `npm start`
2. Open your browser to `http://localhost:3000`
3. You should now see a real Google Maps interface!

## 🎯 **Features Available**

With Google Maps API, you get:
- ✅ **Real map tiles** from Google
- ✅ **Interactive markers** with custom icons
- ✅ **Search functionality** using Google Places API
- ✅ **Directions** using Google Directions API
- ✅ **Geocoding** for address conversion
- ✅ **Info windows** with location details

## 💰 **Pricing**

Google Maps API has a generous free tier:
- **$200 monthly credit** (approximately 28,000 map loads)
- **Free tier includes**:
  - 28,000 map loads per month
  - 1,000 Places API requests per day
  - 2,500 Geocoding requests per day
  - 2,500 Directions requests per day

## 🚀 **Next Steps**

Once you have your API key:
1. Replace the placeholder in `src/config.ts`
2. Restart your development server
3. Enjoy your fully functional Google Maps application!

## 🔒 **Security Notes**

- Never commit your API key to version control
- Use environment variables in production
- Restrict your API key to specific domains
- Monitor your API usage in Google Cloud Console

## 🆘 **Troubleshooting**

If you see errors:
1. Check that all required APIs are enabled
2. Verify your API key is correct
3. Ensure billing is enabled on your Google Cloud project
4. Check the browser console for specific error messages 