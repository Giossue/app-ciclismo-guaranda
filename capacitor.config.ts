import type { CapacitorConfig } from '@capacitor/cli';

const mobileServerUrl = process.env.GUARANDA_GO_MOBILE_SERVER_URL?.trim();

const config: CapacitorConfig = {
    appId: 'ec.edu.ueb.guarandago',
    appName: 'Guaranda Go',
    webDir: 'capacitor-www',
    server: {
        androidScheme: 'https',
        ...(mobileServerUrl
            ? {
                  url: mobileServerUrl,
                  cleartext: mobileServerUrl.startsWith('http://'),
              }
            : {}),
    },
    plugins: {
        CapacitorSQLite: {
            androidIsEncryption: false,
        },
    },
};

export default config;
