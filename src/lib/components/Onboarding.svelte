<script lang="ts">
  import { onboarding } from '$lib/onboarding';
  import { onMount } from 'svelte';
  
  let step = $state(0);
  let complete = $state(true);
  
  const steps = [
    {
      emoji: '⚡',
      title: 'Welcome to Pulse',
      description: 'Take 30 seconds each day to track your mood, energy, and reflect on what matters.'
    },
    {
      emoji: '📊',
      title: 'See Your Patterns',
      description: 'Discover trends in your mood and energy over time. Understand what drives your wellbeing.'
    },
    {
      emoji: '🔥',
      title: 'Build Your Streak',
      description: 'Consistency is key. Build a daily habit and watch your streak grow.'
    }
  ];
  
  onMount(() => {
    onboarding.init();
    const unsub = onboarding.subscribe(s => {
      complete = s.completed;
    });
    return unsub;
  });
  
  function next() {
    if (step < steps.length - 1) {
      step++;
    } else {
      onboarding.complete();
    }
  }
  
  function skip() {
    onboarding.complete();
  }
</script>

{#if !complete}
  <div class="fixed inset-0 bg-bg-primary z-50 flex flex-col">
    <!-- Progress -->
    <div class="flex justify-center gap-2 pt-8 px-4">
      {#each steps as _, i}
        <div 
          class="h-1 rounded-full transition-all {i <= step ? 'w-8 bg-accent' : 'w-2 bg-bg-tertiary'}"
        ></div>
      {/each}
    </div>
    
    <!-- Content -->
    <div class="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div class="text-6xl mb-6 animate-fade-in">{steps[step].emoji}</div>
      <h1 class="text-2xl font-semibold font-[var(--font-outfit)] mb-4 animate-fade-in stagger-1">
        {steps[step].title}
      </h1>
      <p class="text-text-secondary max-w-xs animate-fade-in stagger-2">
        {steps[step].description}
      </p>
    </div>
    
    <!-- Actions -->
    <div class="p-8 flex flex-col gap-3">
      <button onclick={next} class="btn btn-primary w-full">
        {step < steps.length - 1 ? 'Next' : 'Get Started'}
      </button>
      <button onclick={skip} class="btn btn-secondary w-full text-text-tertiary">
        Skip
      </button>
    </div>
  </div>
{/if}
