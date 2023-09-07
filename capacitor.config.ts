import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'dashpay-wallet',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
