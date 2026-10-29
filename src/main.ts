import './style.css';
import { SoundEngine } from './audio/engine';
import { StorageService } from './utils/storage';
import { OnboardingComponent } from './components/Onboarding';
import { DashboardComponent } from './components/Dashboard';
import { BedsideClockComponent } from './components/BedsideClock';
import { MorningModal } from './components/MorningModal';
import { SleepProfile } from './types/sleep';

class App {
  private appRoot: HTMLElement;
  private engine: SoundEngine;
  private currentView: 'onboarding' | 'dashboard' | 'bedside' = 'dashboard';
  private bedsideComponent: BedsideClockComponent | null = null;
  private dashboardComponent: DashboardComponent | null = null;

  constructor() {
    const root = document.querySelector<HTMLDivElement>('#app');
    if (!root) throw new Error('#app element not found');
    this.appRoot = root;
    this.engine = new SoundEngine();

    // Hook engine tick to update components
    this.engine.onTick((state) => {
      if (this.currentView === 'bedside' && this.bedsideComponent) {
        this.bedsideComponent.updateState(state);
      }
    });

    this.initPWA();
    this.initView();
  }

  private initPWA(): void {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch((err) => {
          console.warn('Service Worker registration failed:', err);
        });
      });
    }
  }

  private initView(): void {
    const profile = StorageService.getProfile();
    if (!profile) {
      this.showOnboarding();
    } else {
      this.showDashboard(profile);
      // If returning user and hasn't checked in today, show gentle morning modal
      if (MorningModal.shouldShow()) {
        const modal = new MorningModal();
        modal.render(document.body, () => {});
      }
    }
  }

  private showOnboarding(): void {
    this.currentView = 'onboarding';
    this.appRoot.innerHTML = '';
    const onboarding = new OnboardingComponent();
    onboarding.render(this.appRoot, (newProfile: SleepProfile) => {
      StorageService.saveProfile(newProfile);
      this.showDashboard(newProfile);
    });
  }

  private showDashboard(profile: SleepProfile): void {
    this.currentView = 'dashboard';
    this.appRoot.innerHTML = '';
    this.dashboardComponent = new DashboardComponent(this.engine, profile);
    this.dashboardComponent.render(this.appRoot, {
      onStart: async () => {
        // Unlock Web Audio context via user touch gesture
        await this.engine.init();
        this.engine.start(profile);
        this.showBedside();
      },
      onEditProfile: () => {
        this.showOnboarding();
      }
    });
  }

  private showBedside(): void {
    this.currentView = 'bedside';
    this.appRoot.innerHTML = '';
    this.bedsideComponent = new BedsideClockComponent(this.engine);
    this.bedsideComponent.render(this.appRoot, () => {
      // On exit, return to dashboard
      const profile = StorageService.getProfile();
      if (profile) {
        this.showDashboard(profile);
      } else {
        this.showOnboarding();
      }
    });
  }
}

// Start application
new App();
