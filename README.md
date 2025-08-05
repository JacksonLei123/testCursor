# 🗺️ MapQuest - Google Maps Clone

A fully functional Google Maps clone built with React, TypeScript, and Google Maps API. Features real-time search, interactive markers, directions, and a beautiful modern UI.

## ✨ Features

- 🗺️ **Real Google Maps Integration** - Uses Google Maps JavaScript API
- 🔍 **Smart Search** - Real-time search with Google Places API
- 📍 **Interactive Markers** - Custom colored markers with info windows
- 🧭 **Directions** - Get directions between locations using Google Directions API
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎨 **Modern UI** - Built with Tailwind CSS and Lucide React icons
- 🔄 **Fallback System** - Demo mode when API key is not configured
- ⚡ **TypeScript** - Full type safety throughout the application

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Maps API key (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd mapquest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Get a Google Maps API Key**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable billing (required for API usage)
   - Enable these APIs:
     - Maps JavaScript API
     - Places API
     - Geocoding API
     - Directions API
   - Create credentials → API Key
   - Restrict the key to your domain (recommended)

4. **Configure the API Key**
   - Open `src/config.ts`
   - Replace `'YOUR_GOOGLE_MAPS_API_KEY_HERE'` with your actual API key

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Open your browser**
   - Navigate to `http://localhost:3000`
   - You should see the Google Maps interface!

## 🎯 How to Use

### Search for Places
- Type in the search bar to find locations
- Real-time suggestions will appear as you type
- Click on a suggestion or press Enter to search

### Interact with Markers
- Click on any marker to see location details
- Info windows show location name, address, and rating
- Click "View Details" to open the sidebar

### Get Directions
- Select a location to open the sidebar
- Click "Get Directions" to see the route from Times Square
- View distance, duration, and turn-by-turn directions

### Navigation
- Use the zoom controls in the top-right corner
- Drag to pan around the map
- Double-click to zoom in

## 🏗️ Project Structure

```
src/
├── components/
│   ├── GoogleMap.tsx      # Main Google Maps component
│   ├── SimpleMap.tsx      # Fallback demo map
│   ├── SearchBar.tsx      # Search input with suggestions
│   └── Sidebar.tsx        # Location details panel
├── services/
│   └── api.ts            # Google Maps API integration
├── types.ts              # TypeScript interfaces
├── config.ts             # Configuration and API keys
└── App.tsx               # Main application component
```

## 🔧 Configuration

### API Keys
All API configuration is in `src/config.ts`:

```typescript
export const config = {
  google: {
    apiKey: 'YOUR_GOOGLE_MAPS_API_KEY_HERE',
    libraries: ['places', 'geometry'],
  },
  // ... other settings
};
```

### Environment Variables (Production)
For production, use environment variables:

```typescript
export const config = {
  google: {
    apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places', 'geometry'],
  },
  // ... rest of config
};
```

## 💰 Pricing

Google Maps API has a generous free tier:
- **$200 monthly credit** (approximately 28,000 map loads)
- **Free tier includes**:
  - 28,000 map loads per month
  - 1,000 Places API requests per day
  - 2,500 Geocoding requests per day
  - 2,500 Directions requests per day

## 🎨 Customization

### Adding New Location Types
1. Update the `Location` type in `src/types.ts`
2. Add new type handling in `src/services/api.ts`
3. Update marker colors in `src/components/GoogleMap.tsx`

### Styling
- Uses Tailwind CSS for styling
- Custom colors defined in `tailwind.config.js`
- Icons from Lucide React

### Map Styles
- Change map style in `src/config.ts`
- Available styles: `ROADMAP`, `SATELLITE`, `HYBRID`, `TERRAIN`

## 🔒 Security

- Never commit API keys to version control
- Use environment variables in production
- Restrict API keys to specific domains
- Monitor API usage in Google Cloud Console

## 🐛 Troubleshooting

### Map Not Loading
1. Check that your API key is correct
2. Verify all required APIs are enabled
3. Ensure billing is enabled on your Google Cloud project
4. Check browser console for specific error messages

### Search Not Working
1. Verify Places API is enabled
2. Check API key restrictions
3. Ensure you haven't exceeded daily quotas

### Directions Not Working
1. Verify Directions API is enabled
2. Check API key restrictions
3. Ensure billing is enabled

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify/Vercel
1. Connect your repository
2. Set environment variable: `REACT_APP_GOOGLE_MAPS_API_KEY`
3. Deploy!

### Environment Variables
Set these in your hosting platform:
- `REACT_APP_GOOGLE_MAPS_API_KEY`: Your Google Maps API key

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Google Maps Platform](https://developers.google.com/maps) for the mapping APIs
- [React](https://reactjs.org/) for the UI framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide React](https://lucide.dev/) for icons

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the browser console for errors
3. Verify your API key and billing setup
4. Open an issue on GitHub

---

**Happy Mapping! 🗺️✨** 