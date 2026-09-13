import Constants from 'expo-constants';
const extra = Constants.expoConfig?.extra;
export const environment = extra?.environment === 'production' ? 'production' : 'development';
export const backend = {
  url: typeof extra?.backend?.url === 'string' ? extra.backend.url : '',
  publishableKey:
    typeof extra?.backend?.publishableKey === 'string' ? extra.backend.publishableKey : '',
};
/** Empty until an iOS OAuth client is configured; the browser flow is used until then. */
export const google = {
  iosClientId: typeof extra?.google?.iosClientId === 'string' ? extra.google.iosClientId : '',
};
export const appScheme = environment === 'production' ? 'fitin' : 'fitin-dev';
