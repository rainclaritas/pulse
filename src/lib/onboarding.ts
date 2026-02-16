import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const ONBOARDING_KEY = 'pulse_onboarding_complete';

export interface OnboardingState {
  completed: boolean;
  currentStep: number;
}

function createOnboardingStore() {
  const { subscribe, set, update } = writable<OnboardingState>({
    completed: true,
    currentStep: 0
  });

  return {
    subscribe,
    init() {
      if (browser) {
        const completed = localStorage.getItem(ONBOARDING_KEY) === 'true';
        set({ completed, currentStep: 0 });
      }
    },
    complete() {
      if (browser) {
        localStorage.setItem(ONBOARDING_KEY, 'true');
      }
      set({ completed: true, currentStep: 0 });
    },
    reset() {
      if (browser) {
        localStorage.removeItem(ONBOARDING_KEY);
      }
      set({ completed: false, currentStep: 0 });
    }
  };
}

export const onboarding = createOnboardingStore();
