<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { entries, settings } from '$lib/stores';
  import { onboarding } from '$lib/onboarding';
  import Onboarding from '$lib/components/Onboarding.svelte';
  import { onMount } from 'svelte';
  
  let { children } = $props();
  let deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);
  let showInstallBanner = $state(false);
  
  onMount(() => {
    entries.init();
    settings.init();
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
    
    // Handle PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      showInstallBanner = true;
    });
  });
  
  async function installApp() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    showInstallBanner = false;
  }
  
  const navItems = [
    { href: '/', icon: 'home', label: 'Today' },
    { href: '/trends', icon: 'chart', label: 'Trends' },
    { href: '/history', icon: 'calendar', label: 'History' },
    { href: '/settings', icon: 'settings', label: 'Settings' }
  ];
  
  function getIcon(icon: string) {
    switch (icon) {
      case 'home': return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
      case 'chart': return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>`;
      case 'calendar': return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`;
      case 'settings': return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`;
      default: return '';
    }
  }
</script>

<svelte:head>
  <link rel="manifest" href="/manifest.json">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
  <meta name="theme-color" content="#FF6B4A">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Pulse">
  <title>Pulse</title>
</svelte:head>

<div class="min-h-screen pb-20 md:pb-0 md:pl-20">
  <Onboarding />
  <main class="max-w-lg mx-auto md:max-w-none md:mx-0">
    {@render children()}
  </main>
  
  <!-- PWA Install Banner -->
  {#if showInstallBanner}
    <div class="fixed bottom-20 left-4 right-4 md:bottom-4 md:left-auto md:right-4 md:w-96 bg-bg-secondary border border-white/10 rounded-xl p-4 shadow-xl z-40 animate-slide-up">
      <div class="flex items-start gap-3">
        <div class="text-2xl">⚡</div>
        <div class="flex-1">
          <h3 class="font-medium text-sm">Install Pulse</h3>
          <p class="text-xs text-text-secondary mt-1">Add to home screen for quick access</p>
        </div>
        <button onclick={installApp} class="btn btn-primary text-sm py-2 px-3">
          Install
        </button>
      </div>
    </div>
  {/if}
  
  <!-- Mobile Bottom Nav -->
  <nav class="fixed bottom-0 left-0 right-0 bg-bg-secondary/95 backdrop-blur-md border-t border-white/6 md:hidden z-50 safe-area-bottom">
    <div class="flex justify-around items-center h-16">
      {#each navItems as item}
        <a
          href={item.href}
          class="nav-item {$page.url.pathname === item.href ? 'active' : ''}"
        >
          <div class="w-6 h-6">
            {@html getIcon(item.icon)}
          </div>
          <span class="text-xs">{item.label}</span>
        </a>
      {/each}
    </div>
  </nav>
  
  <!-- Desktop Sidebar -->
  <nav class="hidden md:flex fixed left-0 top-0 bottom-0 w-20 flex-col items-center py-8 bg-bg-secondary border-r border-white/6 z-50">
    <div class="text-2xl font-bold text-accent mb-8">⚡</div>
    <div class="flex flex-col gap-6">
      {#each navItems as item}
        <a
          href={item.href}
          class="nav-item w-12 h-12 rounded-xl justify-center {$page.url.pathname === item.href ? 'active bg-accent/10' : 'hover:bg-white/5'}"
        >
          <div class="w-6 h-6">
            {@html getIcon(item.icon)}
          </div>
        </a>
      {/each}
    </div>
  </nav>
</div>

<style>
  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom, 0);
  }
</style>
