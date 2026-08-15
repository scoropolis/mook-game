import { Capacitor, registerPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { Share } from '@capacitor/share';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
import { AdMob, InterstitialAdPluginEvents } from '@capacitor-community/admob';

interface GameCenterPlugin {
  initialize(): Promise<void>;
  signIn(options?: { silent?: boolean }): Promise<{ signedIn: boolean }>;
  submitScore(options: { leaderboardId: string; score: number }): Promise<void>;
  showLeaderboard(options: { leaderboardId: string }): Promise<void>;
}

const PlayGames = registerPlugin<GameCenterPlugin>('MookGameCenter');

const IOS_TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/4411468910';
const USE_ADMOB_TEST_CONFIGURATION = true;
const GAME_CENTER_LEADERBOARD_ID = 'mook_high_score';

let interstitialReady = false;
let gameCenterReady = false;
let booted = false;

type HapticKind = 'light' | 'medium' | 'heavy' | 'success' | 'error';

interface MookNativeBridge {
  isNative: boolean;
  haptic(kind?: HapticKind): Promise<void>;
  setMuted(muted: boolean): Promise<void>;
  saveSetting(key: string, value: boolean): Promise<void>;
  loadSetting(key: string): Promise<boolean | null>;
  showInterstitial(): Promise<boolean>;
  submitScore(score: number): Promise<void>;
  showLeaderboard(): Promise<boolean>;
  showPrivacyOptions(): Promise<boolean>;
  shareScore(text: string): Promise<boolean>;
}

declare global {
  interface Window { MookNative?: MookNativeBridge; }
}

async function prepareInterstitial(): Promise<void> {
  try {
    await AdMob.prepareInterstitial({
      adId: IOS_TEST_INTERSTITIAL_ID,
      isTesting: true,
      npa: true,
      immersiveMode: true
    });
    interstitialReady = true;
  } catch (error) {
    interstitialReady = false;
    console.warn('AdMob interstitial unavailable', error);
  }
}

async function initializeAdMob(): Promise<void> {
  try {
    await AdMob.initialize();
    if (!USE_ADMOB_TEST_CONFIGURATION) {
      const consent = await AdMob.requestConsentInfo();
      if (!consent.canRequestAds && consent.isConsentFormAvailable) {
        await AdMob.showConsentForm();
      }
    }
    await AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
      interstitialReady = false;
      void prepareInterstitial();
    });
    await AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, () => {
      interstitialReady = false;
      void prepareInterstitial();
    });
    await prepareInterstitial();
  } catch (error) {
    console.warn('AdMob initialization unavailable', error);
  }
}

async function initializeGameCenter(): Promise<void> {
  try {
    await PlayGames.initialize();
    const result = await PlayGames.signIn();
    gameCenterReady = result.signedIn;
  } catch (error) {
    gameCenterReady = false;
    console.warn('Game Center unavailable', error);
  }
}

window.MookNative = {
  isNative: Capacitor.isNativePlatform(),

  async haptic(kind: HapticKind = 'light') {
    try {
      if (kind === 'success') await Haptics.notification({ type: NotificationType.Success });
      else if (kind === 'error') await Haptics.notification({ type: NotificationType.Error });
      else {
        const style = kind === 'heavy' ? ImpactStyle.Heavy : kind === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light;
        await Haptics.impact({ style });
      }
    } catch (_) {}
  },

  async setMuted(muted: boolean) {
    try { await AdMob.setApplicationMuted({ muted }); } catch (_) {}
  },

  async saveSetting(key: string, value: boolean) {
    await Preferences.set({ key: `mook-${key}`, value: value ? '1' : '0' });
  },

  async loadSetting(key: string) {
    const { value } = await Preferences.get({ key: `mook-${key}` });
    return value === null ? null : value === '1';
  },

  async showInterstitial() {
    if (!interstitialReady) return false;
    try {
      interstitialReady = false;
      await AdMob.showInterstitial({ adId: IOS_TEST_INTERSTITIAL_ID });
      return true;
    } catch (_) {
      void prepareInterstitial();
      return false;
    }
  },

  async submitScore(score: number) {
    if (!gameCenterReady || !Number.isFinite(score)) return;
    try {
      await PlayGames.submitScore({ leaderboardId: GAME_CENTER_LEADERBOARD_ID, score: Math.floor(score) });
    } catch (_) {}
  },

  async showLeaderboard() {
    try {
      if (!gameCenterReady) {
        const result = await PlayGames.signIn({ silent: false });
        gameCenterReady = result.signedIn;
      }
      if (!gameCenterReady) return false;
      await PlayGames.showLeaderboard({ leaderboardId: GAME_CENTER_LEADERBOARD_ID });
      return true;
    } catch (_) { return false; }
  },

  async showPrivacyOptions() {
    try {
      await AdMob.showPrivacyOptionsForm();
      return true;
    } catch (_) { return false; }
  },

  async shareScore(text: string) {
    try {
      await Share.share({ title: 'Mook score', text, url: 'https://scoropolis.github.io/mook-game/', dialogTitle: 'Share your Mook score' });
      return true;
    } catch (_) { return false; }
  }
};

async function bootNative(): Promise<void> {
  if (booted || !Capacitor.isNativePlatform()) return;
  booted = true;
  try { await StatusBar.hide(); } catch (_) {}
  await Promise.allSettled([initializeAdMob(), initializeGameCenter()]);
  try { await SplashScreen.hide({ fadeOutDuration: 250 }); } catch (_) {}
  await App.addListener('appStateChange', ({ isActive }) => {
    document.documentElement.classList.toggle('app-inactive', !isActive);
  });
}

window.addEventListener('load', () => { void bootNative(); }, { once: true });
