# Hospital Digital Twin Design System

## 1) Complete Color Palette

### Core
- `primary`: `#2563EB`
- `secondary`: `#0EA5E9`
- `accent`: `#14B8A6`

### Background System
- `main background`: `#0F172A`
- `sidebar background`: `#111827`
- `surface background`: `#1E293B`
- `card background`: `#1F2937`
- `hover surface`: `#273449`

### Glassmorphism
- `glass background`: `rgba(255,255,255,0.06)`
- `glass border`: `rgba(255,255,255,0.15)`
- `glass highlight`: `rgba(255,255,255,0.25)`

### Hospital Status Colors
- `available bed`: `#22C55E`
- `occupied bed`: `#EF4444`
- `cleaning bed`: `#F59E0B`

### Semantic
- `success`: `#16A34A`
- `warning`: `#F59E0B`
- `danger`: `#DC2626`
- `info`: `#0EA5E9`

### Text
- `primary text`: `#F8FAFC`
- `secondary text`: `#CBD5F5`
- `muted text`: `#64748B`
- `disabled text`: `#475569`

### Borders
- `light border`: `rgba(255,255,255,0.08)`
- `glass border`: `rgba(255,255,255,0.15)`
- `divider`: `rgba(255,255,255,0.05)`

## 2) Tailwind Token Mapping

For Tailwind v4 projects using CSS tokens, map semantic names to CSS vars.

```js
// tailwind.config.js (design token reference)
export default {
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#0EA5E9",
        accent: "#14B8A6",
        background: "#0F172A",
        sidebar: "#111827",
        surface: "#1E293B",
        card: "#1F2937",
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626",
        info: "#0EA5E9",
        text: "#F8FAFC",
        muted: "#64748B",
      },
    },
  },
};
```

Recommended class usage:
- `bg-background`, `bg-surface`, `bg-card`
- `text-text`, `text-muted`
- `border-white/10`, `border-white/20`

## 3) Glassmorphism Style Rules

Base glass recipe:

```css
background: rgba(255, 255, 255, 0.06);
backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.15);
border-radius: 16px;
box-shadow: 0 10px 30px -16px rgba(2, 6, 23, 0.9);
```

Tailwind equivalent:
- `bg-white/5`
- `backdrop-blur-xl`
- `border border-white/20`
- `rounded-xl`
- `shadow-lg`

## 4) Typography System

- `font family`: `Inter`
- `page title`: `text-3xl font-semibold`
- `section title`: `text-xl font-semibold`
- `card title`: `text-lg font-medium`
- `body text`: `text-sm`
- `labels`: `text-xs uppercase tracking-wide`

## 5) Spacing Scale

- `small`: `8px` (`space-2`)
- `medium`: `16px` (`space-4`)
- `large`: `24px` (`space-6`)
- `section`: `32px` (`space-8`)

Card padding:
- `p-5` to `p-6` (20px–24px)

## 6) Component Style Specifications

### Cards
- Background: card or glass surface
- Radius: `rounded-xl` (12px) to 16px
- Border: `border border-white/10`
- Hover: subtle elevation and border emphasis

### Buttons
- Primary:
  - `bg-primary text-white rounded-lg px-4 py-2`
- Secondary:
  - `bg-surface border border-white/10 text-slate-100`
- Danger:
  - `bg-danger text-white rounded-lg px-4 py-2`

### Status Badges
- Available:
  - `bg-success/20 text-success border border-success/30`
- Occupied:
  - `bg-danger/20 text-danger border border-danger/30`
- Cleaning:
  - `bg-warning/20 text-warning border border-warning/30`

### Forms
Inputs/selects:
- `bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm`

Focus:
- `border-primary`
- `ring-2 ring-primary/20`

## 7) Dashboard Layout Recommendations

### Sidebar (left)
- Logo
- Dashboard
- Bed Booking
- New Admission
- Doctors
- Notifications
- Settings

Style:
- `bg-sidebar`
- Divider border on right
- Active nav item: `bg-primary/20 border border-primary/40`

### Topbar
- Hospital name
- Admin profile
- Logout button

Style:
- elevated surface card (`bg-surface border border-white/10 rounded-xl`)

### Main Content
- Metrics row
- Charts
- Hospital comparison cards
- Activity/alerts panel

Grid:
- mobile-first with `gap-6`
- metrics as 1/2/4 columns by breakpoint

## 8) Dashboard Card Blueprint

Card contents:
- icon in subtle circle/square
- big metric number
- label + helper text

Metrics:
- Total Beds
- Available Beds
- Occupied Beds
- Beds Cleaning

## 9) Bed Grid (Seat-Selection Style)

Tile style:
- `rounded-lg border p-2`
- hover lift (`hover:-translate-y-px`)
- tooltip on hover

States:
- available: green tint + green border
- occupied: red tint + red border
- cleaning: yellow tint + yellow border

## 10) Notification Panel Design

Panel:
- floating glass panel
- fixed/right in desktop
- stacked cards with urgency rail

Urgency rail:
- emergency: red
- normal/info: blue
- warning: amber

## 11) Accessibility and Readability Rules

- Minimum contrast target: WCAG AA
- Avoid overly transparent text on dark surfaces
- Keep body text at `text-sm` or larger
- Use icon + text for status indicators (not color only)
- Ensure focus rings are visible on all interactive controls

## 12) Implemented Design Assets in This Repo

- CSS token/util system: `frontend/src/styles/design-system.css`
- App base style import and dark-solid background alignment: `frontend/src/App.css`

Use the `ds-*` classes from `design-system.css` to keep visual consistency across new and existing components.
