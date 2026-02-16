import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

export interface DailyEntry {
  id: string;
  date: string;
  mood: number | null;
  energy: number | null;
  highlight: string | null;
  gratitude: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  reminderEnabled: boolean;
  reminderTime: string;
  theme: 'dark' | 'light' | 'system';
}

const STORAGE_KEY_ENTRIES = 'pulse_entries';
const STORAGE_KEY_SETTINGS = 'pulse_settings';

const defaultSettings: Settings = {
  reminderEnabled: false,
  reminderTime: '21:00',
  theme: 'dark'
};

function createEntriesStore() {
  const { subscribe, set, update } = writable<DailyEntry[]>([]);
  
  return {
    subscribe,
    init() {
      if (browser) {
        const stored = localStorage.getItem(STORAGE_KEY_ENTRIES);
        if (stored) {
          try {
            set(JSON.parse(stored));
          } catch (e) {
            console.error('Failed to parse entries', e);
          }
        }
      }
    },
    save(entries: DailyEntry[]) {
      if (browser) {
        localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
      }
      set(entries);
    },
    addOrUpdate(entry: DailyEntry) {
      update(entries => {
        const existing = entries.findIndex(e => e.date === entry.date);
        let newEntries: DailyEntry[];
        if (existing >= 0) {
          newEntries = [...entries];
          newEntries[existing] = { ...entry, updatedAt: Date.now() };
        } else {
          newEntries = [...entries, entry];
        }
        if (browser) {
          localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(newEntries));
        }
        return newEntries;
      });
    },
    getByDate(date: string): DailyEntry | undefined {
      return get({ subscribe }).find(e => e.date === date);
    }
  };
}

function createSettingsStore() {
  const { subscribe, set, update } = writable<Settings>(defaultSettings);
  
  return {
    subscribe,
    init() {
      if (browser) {
        const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            set({ ...defaultSettings, ...parsed });
          } catch (e) {
            console.error('Failed to parse settings', e);
          }
        }
      }
    },
    update(settings: Partial<Settings>) {
      update(current => {
        const newSettings = { ...current, ...settings };
        if (browser) {
          localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings));
        }
        return newSettings;
      });
    }
  };
}

export const entries = createEntriesStore();
export const settings = createSettingsStore();

export const today = derived(entries, ($entries) => {
  const today = new Date().toISOString().split('T')[0];
  return $entries.find(e => e.date === today);
});

export const streak = derived(entries, ($entries) => {
  if ($entries.length === 0) return 0;
  
  const sortedDates = $entries
    .map(e => e.date)
    .sort()
    .reverse();
  
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) return 0;
  
  let count = 0;
  let checkDate = sortedDates[0] === today ? today : yesterday;
  
  for (const date of sortedDates) {
    if (date === checkDate) {
      count++;
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split('T')[0];
    } else if (date < checkDate) {
      break;
    }
  }
  
  return count;
});
