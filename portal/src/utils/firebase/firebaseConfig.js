import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getRemoteConfig, fetchAndActivate, getValue } from 'firebase/remote-config';
import getEnv from '../env';

const firebaseConfig = {
  apiKey: getEnv('VUE_APP_FIREBASE_API_KEY'),
  authDomain: getEnv('VUE_APP_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VUE_APP_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VUE_APP_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VUE_APP_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VUE_APP_FIREBASE_APP_ID'),
  measurementId: getEnv('VUE_APP_FIREBASE_MEASUREMENT_ID'),
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
/* eslint-disable */
const analytics = getAnalytics(app);
const remoteConfig = getRemoteConfig();
remoteConfig.settings.minimumFetchIntervalMillis = getEnv('NODE_ENV') === 'production' ? 3600000 : 1000;

export default async function fetchRemoteConfig(key) {
  await fetchAndActivate(remoteConfig);
  return getValue(remoteConfig, key);
}
