<script lang="ts">
  import { entries, streak } from '$lib/stores';
  import { onMount } from 'svelte';
  
  let range = $state(7);
  
  const rangeOptions = [
    { value: 7, label: '7 days' },
    { value: 30, label: '30 days' },
    { value: 90, label: '90 days' }
  ];
  
  let chartData = $derived.by(() => {
    const data: { date: string; mood: number | null; energy: number | null }[] = [];
    const now = new Date();
    
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = $entries.find(e => e.date === dateStr);
      data.push({
        date: dateStr,
        mood: entry?.mood ?? null,
        energy: entry?.energy ?? null
      });
    }
    
    return data;
  });
  
  let avgMood = $derived.by(() => {
    const valid = chartData.filter(d => d.mood !== null);
    if (valid.length === 0) return 0;
    return valid.reduce((sum, d) => sum + (d.mood || 0), 0) / valid.length;
  });
  
  let avgEnergy = $derived.by(() => {
    const valid = chartData.filter(d => d.energy !== null);
    if (valid.length === 0) return 0;
    return valid.reduce((sum, d) => sum + (d.energy || 0), 0) / valid.length;
  });
  
  let totalEntries = $derived(chartData.filter(d => d.mood !== null).length);
  
  function getBarHeight(val: number | null): number {
    if (val === null) return 0;
    return (val / 10) * 100;
  }
  
  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  }
  
  let maxVal = $derived(Math.max(...chartData.map(d => d.mood || 0), ...chartData.map(d => d.energy || 0), 1));
</script>

<div class="p-4 md:p-8 pt-6">
  <!-- Header -->
  <div class="animate-fade-in">
    <h1 class="text-2xl font-semibold font-[var(--font-outfit)] mb-1">Trends</h1>
    <p class="text-text-secondary text-sm">Your mood & energy over time</p>
  </div>
  
  <!-- Stats Cards -->
  <div class="grid grid-cols-3 gap-3 mt-6">
    <div class="card text-center animate-fade-in stagger-1">
      <div class="text-2xl mb-1">🔥</div>
      <div class="font-[var(--font-jetbrains)] text-xl font-semibold text-accent">{$streak}</div>
      <div class="text-xs text-text-secondary">Day Streak</div>
    </div>
    <div class="card text-center animate-fade-in stagger-2">
      <div class="text-2xl mb-1">😊</div>
      <div class="font-[var(--font-jetbrains)] text-xl font-semibold">{avgMood.toFixed(1)}</div>
      <div class="text-xs text-text-secondary">Avg Mood</div>
    </div>
    <div class="card text-center animate-fade-in stagger-3">
      <div class="text-2xl mb-1">⚡</div>
      <div class="font-[var(--font-jetbrains)] text-xl font-semibold text-accent-secondary">{avgEnergy.toFixed(1)}</div>
      <div class="text-xs text-text-secondary">Avg Energy</div>
    </div>
  </div>
  
  <!-- Range Selector -->
  <div class="flex gap-2 mt-6 animate-fade-in stagger-2">
    {#each rangeOptions as opt}
      <button
        onclick={() => range = opt.value}
        class="btn flex-1 {range === opt.value ? 'btn-primary' : 'btn-secondary'}"
      >
        {opt.label}
      </button>
    {/each}
  </div>
  
  <!-- Chart -->
  <div class="card mt-4 animate-fade-in stagger-3">
    <div class="flex justify-between items-center mb-4">
      <span class="text-sm text-text-secondary">Check-ins: {totalEntries}/{range}</span>
    </div>
    
    <div class="relative h-48">
      <!-- Y-axis labels -->
      <div class="absolute left-0 top-0 bottom-6 w-6 flex flex-col justify-between text-xs text-text-tertiary">
        <span>10</span>
        <span>5</span>
        <span>0</span>
      </div>
      
      <!-- Bars -->
      <div class="ml-8 h-full flex items-end gap-1">
        {#each chartData as day, i}
          <div class="flex-1 flex flex-col items-center gap-1">
            <div class="w-full flex gap-0.5 items-end h-40">
              {#if day.mood !== null}
                <div 
                  class="flex-1 rounded-t-sm transition-all hover:opacity-80"
                  style="height: {getBarHeight(day.mood)}%; background: var(--color-accent)"
                  title="Mood: {day.mood}"
                ></div>
              {/if}
              {#if day.energy !== null}
                <div 
                  class="flex-1 rounded-t-sm transition-all hover:opacity-80"
                  style="height: {getBarHeight(day.energy)}%; background: var(--color-accent-secondary)"
                  title="Energy: {day.energy}"
                ></div>
              {/if}
              {#if day.mood === null && day.energy === null}
                <div class="w-full h-0.5 bg-bg-tertiary rounded"></div>
              {/if}
            </div>
            <span class="text-[10px] text-text-tertiary -rotate-45 origin-left translate-y-1 whitespace-nowrap">
              {formatDate(day.date)}
            </span>
          </div>
        {/each}
      </div>
    </div>
    
    <!-- Legend -->
    <div class="flex justify-center gap-6 mt-4 pt-4 border-t border-white/6">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-sm bg-accent"></div>
        <span class="text-xs text-text-secondary">Mood</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-sm bg-accent-secondary"></div>
        <span class="text-xs text-text-secondary">Energy</span>
      </div>
    </div>
  </div>
  
  <!-- Empty State -->
  {#if totalEntries === 0}
    <div class="card mt-4 text-center py-8 animate-fade-in">
      <div class="text-4xl mb-2">📊</div>
      <p class="text-text-secondary">No data yet</p>
      <p class="text-text-tertiary text-sm mt-1">Start checking in to see your trends!</p>
    </div>
  {/if}
</div>
