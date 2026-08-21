import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.babywatch.app',
  appName: 'BabyWatch',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'babywatch-production.up.railway.app',
      'babywatch.vercel.app',
      'nominatim.openstreetmap.org',
      'unpkg.com',
    ]
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#0f1923',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f1923',
      showSpinner: false,
    },
  },
};

export default config;