<script lang="ts">
  import { entries } from '$lib/stores';
  import type { DailyEntry } from '$lib/stores';
  
  let currentMonth = $state(new Date());
  
  let monthEntries = $derived.by(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const result: { day: number; entry: DailyEntry | null }[] = [];
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const entry = $entries.find(e => e.date === dateStr) ?? null;
      result.push({ day: d, entry });
    }
    
    return result;
  });
  
  let firstDayOffset = $derived(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay());
  
  function prevMonth() {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  }
  
  function nextMonth() {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  }
  
  function getMoodColor(mood: number | null): string {
    if (mood === null) return 'transparent';
    if (mood <= 3) return '#EF4444';
    if (mood <= 6) return '#FBBF24';
    return '#4AEFB8';
  }
  
  function formatMonth(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  
  function isToday(day: number): boolean {
    const today = new Date();
    return day === today.getDate() && 
           currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear();
  }
  
  function isFuture(day: number): boolean {
    const today = new Date();
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return checkDate > today;
  }
  
  let selectedEntry = $state<DailyEntry | null>(null);
  
  function selectEntry(entry: DailyEntry | null) {
    selectedEntry = entry;
  }
</script>

<div class="p-4 md:p-8 pt-6">
  <!-- Header -->
  <div class="animate-fade-in">
    <h1 class="text-2xl font-semibold font-[var(--font-outfit)] mb-1">History</h1>
    <p class="text-text-secondary text-sm">Your past check-ins</p>
  </div>
  
  <!-- Calendar -->
  <div class="card mt-6 animate-fade-in stagger-1">
    <!-- Month Nav -->
    <div class="flex items-center justify-between mb-4">
      <button onclick={prevMonth} class="btn btn-secondary p-2" aria-label="Previous month">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <span class="font-medium">{formatMonth(currentMonth)}</span>
      <button onclick={nextMonth} class="btn btn-secondary p-2" aria-label="Next month">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
    
    <!-- Weekday Headers -->
    <div class="grid grid-cols-7 gap-1 mb-2">
      {#each ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as day}
        <div class="text-center text-xs text-text-tertiary py-1">{day}</div>
      {/each}
    </div>
    
    <!-- Calendar Grid -->
    <div class="grid grid-cols-7 gap-1">
      {#each Array(firstDayOffset) as _}
        <div></div>
      {/each}
      
      {#each monthEntries as { day, entry }}
        <button
          onclick={() => entry && selectEntry(entry)}
          disabled={!entry || isFuture(day)}
          class="aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative {isToday(day) ? 'ring-2 ring-accent' : ''} {entry ? 'cursor-pointer hover:bg-white/5' : 'cursor-default'}"
        >
          <span class="{entry ? 'text-text-primary' : 'text-text-tertiary'}">{day}</span>
          {#if entry}
            <div 
              class="absolute bottom-1 w-1.5 h-1.5 rounded-full"
              style="background: {getMoodColor(entry.mood)}"
            ></div>
          {/if}
        </button>
      {/each}
    </div>
  </div>
  
  <!-- Selected Entry Detail -->
  {#if selectedEntry}
    <div class="card mt-4 animate-scale-in">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="font-medium">{new Date(selectedEntry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
        </div>
        <button onclick={() => selectEntry(null)} class="text-text-tertiary hover:text-text-primary" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      
      <div class="flex gap-4 mb-4">
        <div class="flex-1 bg-bg-tertiary rounded-lg p-3 text-center">
          <div class="text-2xl mb-1">
            {#if selectedEntry.mood}
              {#if selectedEntry.mood <= 2}😢{:else if selectedEntry.mood <= 4}😕{:else if selectedEntry.mood <= 6}😐{:else if selectedEntry.mood <= 8}🙂{:else}😄{/if}
            {:else}—
            {/if}
          </div>
          <div class="text-xs text-text-secondary">Mood</div>
          <div class="font-[var(--font-jetbrains)] text-accent">{selectedEntry.mood ?? '—'}/10</div>
        </div>
        <div class="flex-1 bg-bg-tertiary rounded-lg p-3 text-center">
          <div class="text-2xl mb-1">⚡</div>
          <div class="text-xs text-text-secondary">Energy</div>
          <div class="font-[var(--font-jetbrains)] text-accent-secondary">{selectedEntry.energy ?? '—'}/10</div>
        </div>
      </div>
      
      {#if selectedEntry.highlight}
        <div class="mb-3">
          <div class="text-xs text-text-tertiary mb-1">✨ Highlight</div>
          <p class="text-sm">{selectedEntry.highlight}</p>
        </div>
      {/if}
      
      {#if selectedEntry.gratitude}
        <div>
          <div class="text-xs text-text-tertiary mb-1">🙏 Grateful for</div>
          <p class="text-sm">{selectedEntry.gratitude}</p>
        </div>
      {/if}
    </div>
  {/if}
  
  <!-- Recent Entries List -->
  <div class="mt-6 animate-fade-in stagger-2">
    <h3 class="font-medium mb-3">Recent</h3>
    <div class="space-y-2">
      {#each $entries.slice().reverse().slice(0, 5) as entry}
        <button onclick={() => selectEntry(entry)} class="card w-full text-left hover:bg-bg-tertiary transition-colors">
          <div class="flex items-center gap-3">
            <div 
              class="w-3 h-3 rounded-full"
              style="background: {getMoodColor(entry.mood)}"
            ></div>
            <div class="flex-1">
              <div class="text-sm">{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            </div>
            <div class="text-xs text-text-tertiary">
              {entry.mood ?? '—'}/{entry.energy ?? '—'}
            </div>
          </div>
        </button>
      {:else}
        <p class="text-text-tertiary text-sm text-center py-4">No entries yet</p>
      {/each}
    </div>
  </div>
</div>
