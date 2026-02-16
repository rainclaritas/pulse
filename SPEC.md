# Pulse - Daily Check-in App Specification

## Project Overview

**Name:** Pulse
**Type:** Mobile-first daily wellness check-in web app
**Core Functionality:** A minimal, beautiful daily check-in app that takes <60 seconds per day. Users track mood (1-10), energy (1-10), one highlight, and one gratitude item. Trends visualize over time.
**Target Users:** Anyone wanting to build self-awareness through daily micro-reflections

---

## UI/UX Specification

### Layout Structure

**Pages:**
1. **Today** (`/`) - Main check-in page
2. **Trends** (`/trends`) - Charts and insights
3. **History** (`/history`) - Calendar view of past entries
4. **Settings** (`/settings`) - Reminder time, data export

**Navigation:** Bottom tab bar (mobile) / Sidebar (desktop)
- Today (home icon)
- Trends (chart icon)
- History (calendar icon)
- Settings (gear icon)

**Responsive Breakpoints:**
- Mobile: < 640px (primary target)
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Visual Design

**Color Palette:**
- Background Primary: `#0A0A0F` (deep night)
- Background Secondary: `#12121A` (card surfaces)
- Background Tertiary: `#1A1A24` (elevated elements)
- Accent Primary: `#FF6B4A` (warm coral - mood high)
- Accent Secondary: `#4AEFB8` (mint green - energy/positive)
- Accent Tertiary: `#A78BFA` (soft violet - highlights)
- Text Primary: `#FAFAFA` (white)
- Text Secondary: `#A1A1AA` (muted gray)
- Text Tertiary: `#52525B` (subtle)
- Danger: `#EF4444` (mood low indicator)
- Success: `#22C55E`

**Light Mode Palette:**
- Background Primary: `#FAFAFA`
- Background Secondary: `#FFFFFF`
- Background Tertiary: `#F4F4F5`
- Accent colors remain same (vibrant against light)
- Text Primary: `#18181B`
- Text Secondary: `#71717A`
- Text Tertiary: `#D4D4D8`

**Typography:**
- Headings: `"Outfit", sans-serif` - Modern geometric sans
- Body: `"DM Sans", sans-serif` - Clean and readable
- Numbers/Stats: `"JetBrains Mono", monospace` - For metrics
- Sizes:
  - H1: 2rem / 600 weight
  - H2: 1.5rem / 600 weight
  - H3: 1.25rem / 500 weight
  - Body: 1rem / 400 weight
  - Small: 0.875rem / 400 weight
  - Tiny: 0.75rem / 400 weight

**Spacing System:**
- Base unit: 4px
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px

**Visual Effects:**
- Cards: `border-radius: 16px`, subtle border `rgba(255,255,255,0.06)`
- Buttons: `border-radius: 12px`, scale on press (0.97)
- Shadows: Soft glow for accents `0 0 20px rgba(255,107,74,0.3)`
- Transitions: `200ms ease-out` default
- Animations: Staggered fade-in on page load

### Components

**1. Check-in Card**
- Mood slider (1-10) with emoji faces 😢 😕 😐 🙂 😄
- Energy slider (1-10) with visual battery indicator
- Text input for highlight (max 140 chars, character count)
- Text input for gratitude (max 140 chars)
- "Save" button - prominent, accent color

**2. Slider Component**
- Custom thumb with current value
- Gradient track (red → yellow → green)
- Haptic-style animation on change
- Value display above thumb

**3. Trend Chart**
- Line chart for mood/energy over 7/30/90 days
- Soft area fill under line
- Interactive - tap to see day details
- Average badges

**4. Calendar View**
- Month grid
- Color-coded dots (mood → red/yellow/green)
- Tap day to view/edit entry

**5. Bottom Navigation**
- 4 icons with labels
- Active state: accent color + slight scale
- Safe area padding on mobile

---

## Functionality Specification

### Core Features

**Daily Check-in:**
- One entry per day (edit allowed)
- All fields optional but encouraged
- Auto-save as typing (debounced)
- Success animation on save

**Trends:**
- 7-day, 30-day, 90-day views
- Average mood and energy displayed
- Streak counter (consecutive days)
- Best/worst days highlighted

**History:**
- Calendar view with mood indicators
- List view of past entries
- Tap to view full entry details

**Settings:**
- Reminder time picker (default: 9 PM)
- Enable/disable reminders
- Export data as JSON
- Clear all data option
- Theme toggle (dark/light/system)

### User Interactions

- Swipe between days on history
- Pull to refresh on today
- Long-press on calendar day for quick view
- Keyboard-friendly (tab navigation)

### Data Handling

- Store in localStorage (MVP)
- Later: Sync to server with user account
- Data structure:
```typescript
interface DailyEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mood: number | null; // 1-10
  energy: number | null; // 1-10
  highlight: string | null;
  gratitude: string | null;
  createdAt: number;
  updatedAt: number;
}
```

### Edge Cases

- No entry for today → Show empty check-in
- Missing fields → Allow save, show partial state
- Future dates → Disabled
- Very long text → Truncate with "..."

---

## Acceptance Criteria

1. ✅ User can complete a daily check-in in <60 seconds
2. ✅ User can view mood/energy trends over time
3. ✅ User can browse history by calendar
4. ✅ User can set reminder time
5. ✅ App is fully responsive (mobile-first)
6. ✅ Dark/light mode works correctly
7. ✅ Data persists across sessions (localStorage)
8. ✅ Animations are smooth (60fps)
9. ✅ Page loads in <2 seconds
10. ✅ No console errors in production
