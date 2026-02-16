<script lang="ts">
  import { entries, settings } from '$lib/stores';
  import { onMount } from 'svelte';
  
  let notificationPermission = $state<NotificationPermission>('default');
  let subscribed = $state(false);
  
  onMount(() => {
    if ('Notification' in window) {
      notificationPermission = Notification.permission;
    }
    
    // Check if we have a subscription stored
    const sub = localStorage.getItem('pulse_notification_sub');
    subscribed = !!sub;
  });
  
  async function requestNotificationPermission() {
    if (!('Notification' in window)) {
      alert('Notifications not supported in this browser');
      return;
    }
    
    const permission = await Notification.requestPermission();
    notificationPermission = permission;
    
    if (permission === 'granted') {
      await subscribeToPush();
    }
  }
  
  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U')
      });
      
      // Store subscription (in real app, send to server)
      localStorage.setItem('pulse_notification_sub', JSON.stringify(subscription));
      subscribed = true;
      
      // Schedule daily reminder
      scheduleReminder();
    } catch (err) {
      console.error('Failed to subscribe to push:', err);
    }
  }
  
  function scheduleReminder() {
    const settingsVal = $settings;
    if (!settingsVal.reminderEnabled) return;
    
    // Request permission for alarms if available
    if ('Notification' in window && Notification.permission === 'granted') {
      // Show test notification
      new Notification('Pulse', {
        body: 'Reminders set! You\'ll be notified daily.',
        icon: '/icon-192.png'
      });
    }
  }
  
  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  
  let reminderEnabled = $state(false);
  let reminderTime = $state('21:00');
  
  // Subscribe to settings changes
  const unsub = settings.subscribe(s => {
    reminderEnabled = s.reminderEnabled;
    reminderTime = s.reminderTime;
  });
  
  function toggleReminder() {
    settings.update({ reminderEnabled: !reminderEnabled });
    if (!reminderEnabled) {
      requestNotificationPermission();
    }
  }
  
  function updateReminderTime(e: Event) {
    const target = e.target as HTMLInputElement;
    settings.update({ reminderTime: target.value });
    if (reminderEnabled && notificationPermission === 'granted') {
      scheduleReminder();
    }
  }
</script>

<div class="p-4 md:p-8 pt-6">
  <!-- Header -->
  <div class="animate-fade-in">
    <h1 class="text-2xl font-semibold font-[var(--font-outfit)] mb-1">Settings</h1>
    <p class="text-text-secondary text-sm">Customize your experience</p>
  </div>
  
  <!-- Notifications Section -->
  <div class="card mt-6 animate-fade-in stagger-1">
    <h2 class="font-medium mb-4">🔔 Notifications</h2>
    
    {#if notificationPermission === 'default'}
      <button onclick={requestNotificationPermission} class="btn btn-primary w-full">
        Enable Notifications
      </button>
      <p class="text-xs text-text-tertiary mt-2">Get reminded to check in daily</p>
    {:else if notificationPermission === 'denied'}
      <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
        <p class="text-sm text-red-400">Notifications blocked</p>
        <p class="text-xs text-text-tertiary mt-1">Enable in browser settings to receive reminders</p>
      </div>
    {:else}
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
    {/if}
  </div>
  
  <!-- Theme Section -->
  <div class="card mt-4 animate-fade-in stagger-2">
    <h2 class="font-medium mb-4">🎨 Appearance</h2>
    
    <div class="grid grid-cols-3 gap-2">
      <button
        onclick={() => settings.update({ theme: 'light' })}
        class="btn {$settings.theme === 'light' ? 'btn-primary' : 'btn-secondary'}"
      >
        ☀️ Light
      </button>
      <button
        onclick={() => settings.update({ theme: 'dark' })}
        class="btn {$settings.theme === 'dark' ? 'btn-primary' : 'btn-secondary'}"
      >
        🌙 Dark
      </button>
      <button
        onclick={() => settings.update({ theme: 'system' })}
        class="btn {$settings.theme === 'system' ? 'btn-primary' : 'btn-secondary'}"
      >
        💻 System
      </button>
    </div>
  </div>
  
  <!-- Data Section -->
  <div class="card mt-4 animate-fade-in stagger-3">
    <h2 class="font-medium mb-4">💾 Data</h2>
    
    <div class="text-sm text-text-secondary mb-4">
      You have {$entries.length} check-in{$entries.length === 1 ? '' : 's'} saved locally.
    </div>
    
    <div class="flex gap-2">
      <button onclick={() => {
        const data = { entries: $entries, exportedAt: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pulse-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }} class="btn btn-secondary flex-1">
        📤 Export JSON
      </button>
      <button onclick={() => {
        if (confirm('Are you sure you want to delete all your data? This cannot be undone.')) {
          entries.save([]);
        }
      }} class="btn bg-red-500/20 text-red-400 hover:bg-red-500/30 flex-1">
        🗑️ Clear All
      </button>
    </div>
  </div>
  
  <!-- Reset Onboarding -->
  <div class="card mt-4 animate-fade-in stagger-4">
    <h2 class="font-medium mb-4">🔄 Reset</h2>
    <button onclick={() => {
      localStorage.removeItem('pulse_onboarding_complete');
      location.reload();
    }} class="btn btn-secondary w-full">
      Replay On</button>
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
