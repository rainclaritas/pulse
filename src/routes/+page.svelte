<script lang="ts">
  import { entries, today, settings, streak } from '$lib/stores';
  import { onMount } from 'svelte';
  
  let mood = $state(5);
  let energy = $state(5);
  let highlight = $state('');
  let gratitude = $state('');
  let saving = $state(false);
  let saved = $state(false);
  
  const todayDate = new Date().toISOString().split('T')[0];
  
  const moodEmojis = ['😢', '😕', '😐', '🙂', '😄'];
  const moodLabels = ['Awful', 'Bad', 'Okay', 'Good', 'Great'];
  
  // Quick stats
  let totalCheckins = $derived($entries.length);
  let currentStreak = $derived($streak);
  let hasCheckedInToday = $derived(!!$today);
  
  onMount(() => {
    const existing = $today;
    if (existing) {
      mood = existing.mood ?? 5;
      energy = existing.energy ?? 5;
      highlight = existing.highlight ?? '';
      gratitude = existing.gratitude ?? '';
    }
    
    // Apply theme
    const unsub = settings.subscribe(s => {
      if (s.theme === 'dark' || (s.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
      }
    });
    return unsub;
  });
  
  function save() {
    saving = true;
    
    const entry = {
      id: crypto.randomUUID(),
      date: todayDate,
      mood,
      energy,
      highlight: highlight.trim() || null,
      gratitude: gratitude.trim() || null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    entries.addOrUpdate(entry);
    
    // Manually save to localStorage to ensure it works
    const current = JSON.parse(localStorage.getItem('pulse_entries') || '[]');
    const idx = current.findIndex((e: any) => e.date === todayDate);
    if (idx >= 0) {
      current[idx] = entry;
    } else {
      current.push(entry);
    }
    localStorage.setItem('pulse_entries', JSON.stringify(current));
    
    saving = false;
    saved = true;
    setTimeout(() => saved = false, 2000);
  }
  
  function getMoodEmoji(val: number): string {
    const idx = Math.min(4, Math.floor((val - 1) / 2.5));
    return moodEmojis[idx];
  }
  
  function shareMood() {
    const emoji = getMoodEmoji(mood);
    const text = `Today's mood: ${mood}/10 ${emoji}\nEnergy: ${energy}/10 ⚡\n\n#PulseDaily`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Pulse Check-in',
        text: text
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard! 📋');
    }
  }
</script>

<div class="p-4 md:p-8 pt-6">
  <!-- Header -->
  <div class="animate-fade-in">
    <h1 class="text-2xl font-semibold font-[var(--font-outfit)] mb-1">How are you feeling?</h1>
    <p class="text-text-secondary text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
  </div>
  
  <!-- Quick Stats -->
  <div class="flex gap-3 mt-4 animate-fade-in">
    <div class="flex-1 bg-bg-secondary rounded-xl p-3 text-center border border-white/6">
      <div class="text-xl">🔥</div>
      <div class="font-[var(--font-jetbrains)] font-semibold">{currentStreak}</div>
      <div class="text-xs text-text-tertiary">Streak</div>
    </div>
    <div class="flex-1 bg-bg-secondary rounded-xl p-3 text-center border border-white/6">
      <div class="text-xl">📊</div>
      <div class="font-[var(--font-jetbrains)] font-semibold">{totalCheckins}</div>
      <div class="text-xs text-text-tertiary">Check-ins</div>
    </div>
    <div class="flex-1 bg-bg-secondary rounded-xl p-3 text-center border border-white/6 {hasCheckedInToday ? 'border-accent/50' : ''}">
      <div class="text-xl">{hasCheckedInToday ? '✅' : '⏳'}</div>
      <div class="font-[var(--font-jetbrains)] font-semibold">{hasCheckedInToday ? 'Done' : 'Pending'}</div>
      <div class="text-xs text-text-tertiary">Today</div>
    </div>
  </div>
  
  <!-- Mood Slider -->
  <div class="card mt-6 animate-fade-in stagger-1">
    <div class="flex items-center justify-between mb-4">
      <label for="mood-slider" class="text-sm font-medium text-text-secondary">Mood</label>
      <span class="text-3xl animate-pulse" style="opacity: {saved ? 1 : 0}">✨</span>
    </div>
    
    <div class="relative mb-2">
      <input
        id="mood-slider"
        type="range"
        min="1"
        max="10"
        bind:value={mood}
        class="w-full h-3 rounded-full appearance-none cursor-pointer slider"
        style="background: linear-gradient(to right, #EF4444 0%, #FBBF24 50%, #4AEFB8 100%)"
      />
    </div>
    
    <div class="flex justify-between items-center">
      <span class="text-2xl">{getMoodEmoji(mood)}</span>
      <span class="font-[var(--font-jetbrains)] text-accent font-medium">{mood}/10</span>
    </div>
  </div>
  
  <!-- Energy Slider -->
  <div class="card mt-4 animate-fade-in stagger-2">
    <label for="energy-slider" class="text-sm font-medium text-text-secondary block mb-4">Energy</label>
    
    <div class="relative mb-2">
      <input
        id="energy-slider"
        type="range"
        min="1"
        max="10"
        bind:value={energy}
        class="w-full h-3 rounded-full appearance-none cursor-pointer slider"
        style="background: linear-gradient(to right, #3B82F6 0%, #A78BFA 50%, #FBBF24 100%)"
      />
    </div>
    
    <div class="flex justify-between items-center">
      <div class="flex gap-1">
        {#each Array(10) as _, i}
          <div 
            class="w-2 h-4 rounded-sm transition-all {i < energy ? 'bg-accent-secondary' : 'bg-bg-tertiary'}"
            style="transform: scaleY({i < energy ? 0.5 + (i / 20) : 0.5})"
          ></div>
        {/each}
      </div>
      <span class="font-[var(--font-jetbrains)] text-accent-secondary font-medium">{energy}/10</span>
    </div>
  </div>
  
  <!-- Highlight -->
  <div class="card mt-4 animate-fade-in stagger-3">
    <label for="highlight-input" class="text-sm font-medium text-text-secondary block mb-2">
      ✨ Best part of your day
    </label>
    <textarea
      id="highlight-input"
      bind:value={highlight}
      maxlength="140"
      rows="2"
      placeholder="What made today great?"
      class="input resize-none"
    ></textarea>
    <div class="text-right text-xs text-text-tertiary mt-1">{highlight.length}/140</div>
  </div>
  
  <!-- Gratitude -->
  <div class="card mt-4 animate-fade-in stagger-4">
    <label for="gratitude-input" class="text-sm font-medium text-text-secondary block mb-2">
      🙏 Grateful for
    </label>
    <textarea
      id="gratitude-input"
      bind:value={gratitude}
      maxlength="140"
      rows="2"
      placeholder="What's one thing you're thankful for?"
      class="input resize-none"
    ></textarea>
    <div class="text-right text-xs text-text-tertiary mt-1">{gratitude.length}/140</div>
  </div>
  
  <!-- Save Button -->
  <div class="flex gap-2 mt-6 animate-fade-in stagger-5">
    <button
      onclick={save}
      disabled={saving}
      class="btn btn-primary flex-1 text-lg font-medium {saved ? 'bg-green-500' : ''}"
    >
      {#if saving}
        Saving...
      {:else if saved}
        Saved! ✓
      {:else}
        Save Check-in
      {/if}
    </button>
    
    {#if saved}
      <button
        onclick={shareMood}
        class="btn btn-secondary px-4"
        aria-label="Share your mood"
      >
        📤
      </button>
    {/if}
  </div>
  
  <!-- Tips -->
  <div class="mt-8 text-center text-text-tertiary text-sm animate-fade-in">
    <p>Take 30 seconds to reflect. Build your streak! 🔥</p>
  </div>
</div>

<style>
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    border: 3px solid #FF6B4A;
  }
  
  .slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    border: 3px solid #FF6B4A;
  }
</style>
