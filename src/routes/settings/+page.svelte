<script lang="ts">
  import { entries, settings } from '$lib/stores';
  import { onMount } from 'svelte';
  
  let reminderEnabled = $state(false);
  let reminderTime = $state('21:00');
  let theme = $state<'dark' | 'light' | 'system'>('dark');
  
  onMount(() => {
    const unsub = settings.subscribe(s => {
      reminderEnabled = s.reminderEnabled;
      reminderTime = s.reminderTime;
      theme = s.theme;
    });
    return unsub;
  });
  
  function toggleReminder() {
    settings.update({ reminderEnabled: !reminderEnabled });
  }
  
  function updateReminderTime(e: Event) {
    const target = e.target as HTMLInputElement;
    settings.update({ reminderTime: target.value });
  }
  
  function updateTheme(newTheme: 'dark' | 'light' | 'system') {
    theme = newTheme;
    settings.update({ theme });
    
    if (newTheme === 'dark') {
      document.documentElement.classList.remove('light');
    } else if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      // System
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
      }
    }
  }
  
  function exportData() {
    const data = {
      entries: $entries,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulse-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  function clearData() {
    if (confirm('Are you sure you want to delete all your data? This cannot be undone.')) {
      entries.save([]);
    }
  }
  
  let entryCount = $derived($entries.length);
</script>

<div class="p-4 md:p-8 pt-6">
  <!-- Header -->
  <div class="animate-fade-in">
    <h1 class="text-2xl font-semibold font-[var(--font-outfit)] mb-1">Settings</h1>
    <p class="text-text-secondary text-sm">Customize your experience</p>
  </div>
  
  <!-- Reminders Section -->
  <div class="card mt-6 animate-fade-in stagger-1">
    <h2 class="font-medium mb-4">Reminders</h2>
    
    <div class="flex items-center justify-between mb-4">
      <div>
        <div class="text-sm">Daily reminder</div>
        <div class="text-xs text-text-tertiary">Get prompted to check in</div>
      </div>
      <button
        onclick={toggleReminder}
        class="w-12 h-7 rounded-full transition-colors {reminderEnabled ? 'bg-accent' : 'bg-bg-tertiary'}"
      >
        <div class="w-5 h-5 rounded-full bg-white transition-transform {reminderEnabled ? 'translate-x-6' : 'translate-x-1'}"></div>
      </button>
    </div>
    
    {#if reminderEnabled}
      <div class="animate-fade-in">
        <label class="text-sm text-text-secondary block mb-2">Reminder time</label>
        <input
          type="time"
          value={reminderTime}
          onchange={updateReminderTime}
          class="input w-32"
        />
      </div>
    {/if}
  </div>
  
  <!-- Theme Section -->
  <div class="card mt-4 animate-fade-in stagger-2">
    <h2 class="font-medium mb-4">Appearance</h2>
    
    <div class="grid grid-cols-3 gap-2">
      <button
        onclick={() => updateTheme('light')}
        class="btn {theme === 'light' ? 'btn-primary' : 'btn-secondary'}"
      >
        ☀️ Light
      </button>
      <button
        onclick={() => updateTheme('dark')}
        class="btn {theme === 'dark' ? 'btn-primary' : 'btn-secondary'}"
      >
        🌙 Dark
      </button>
      <button
        onclick={() => updateTheme('system')}
        class="btn {theme === 'system' ? 'btn-primary' : 'btn-secondary'}"
      >
        💻 System
      </button>
    </div>
  </div>
  
  <!-- Data Section -->
  <div class="card mt-4 animate-fade-in stagger-3">
    <h2 class="font-medium mb-4">Data</h2>
    
    <div class="text-sm text-text-secondary mb-4">
      You have {entryCount} check-in{entryCount === 1 ? '' : 's'} saved locally.
    </div>
    
    <div class="flex gap-2">
      <button onclick={exportData} class="btn btn-secondary flex-1">
        📤 Export JSON
      </button>
      <button onclick={clearData} class="btn bg-red-500/20 text-red-400 hover:bg-red-500/30 flex-1">
        🗑️ Clear All
      </button>
    </div>
  </div>
  
  <!-- About -->
  <div class="card mt-4 animate-fade-in stagger-4">
    <h2 class="font-medium mb-2">About</h2>
    <p class="text-sm text-text-secondary">
      <strong>Pulse</strong> - Daily check-in app<br>
      Version 1.0.0
    </p>
    <p class="text-xs text-text-tertiary mt-3">
      Take 30 seconds each day to reflect. Over time, you'll see patterns in your mood and energy that can help you live a more balanced life.
    </p>
  </div>
</div>
