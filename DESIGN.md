---
name: Stellar Nexus
description: Full-stack serverless application with a Quasar/Vue frontend and AWS Architect Lambda backend
colors:
  primary: "#1B3A5C"
  primary-hover: "#142E4A"
  primary-white: "#FFFFEA"
  accent: "#FF5E5B"
  accent-hover: "#E04E4B"
  secondary: "#CBD5E1"
  secondary-yellow: "#FFED66"
  background: "#F5F7FA"
  card-bg: "#FFFFFF"
  surface: "#E8ECF1"
  border: "rgba(0, 0, 0, 0.08)"
  text-primary: "#1A2332"
  text-secondary: "#4A5568"
  text-muted: "#8896A6"
  off-white: "#fafafa"
  dark: "#1D1D1D"
  dark-surface: "#121212"
  dark-elevated: "#1e1e1e"
  dark-card-bg: "#1E2228"
  dark-border: "rgba(255, 255, 255, 0.08)"
  dark-text-primary: "#E8ECF1"
  dark-text-secondary: "#8896A6"
  dark-text-muted: "#5A6678"
  dark-nav-active-bg: "#1E3A5F"
  dark-nav-active-text: "#4A7ABF"
  dark-table-row-hover: "#1a2537"
  table-row-hover: "#EDF2F7"
  font: "#333"
  heading: "#2C3539"
  positive: "#2ECC71"
  negative: "#ef4637"
  info: "#31CCEC"
  warning: "#F2C037"
  chart-blue: "rgba(54, 162, 235, 0.6)"
  chart-blue-border: "rgba(54, 162, 235, 1)"
typography:
  display-lg:
    fontFamily: Anton
    fontSize: 24px
    fontWeight: 700
    lineHeight: 32px
  headline-md:
    fontFamily: Anton
    fontSize: 20px
    fontWeight: 600
    lineHeight: 28px
  body-lg:
    fontFamily: Poppins Medium
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
  body-md:
    fontFamily: Poppins Medium
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  body-sm:
    fontFamily: Poppins Medium
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
  label-sm:
    fontFamily: Poppins Medium
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0.05em
  metric-value:
    fontFamily: Anton
    fontSize: 24px
    fontWeight: 700
    lineHeight: 32px
  metric-label:
    fontFamily: Poppins Medium
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0.05em
  code:
    fontFamily: "JetBrains Mono"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  pill: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  card-padding: 16px
  sidebar-width: 260px
components:
  header-toolbar:
    backgroundColor: "{colors.card-bg}"
    textColor: "{colors.text-primary}"
    height: 64px
    padding: "{spacing.lg}"
  metric-card:
    backgroundColor: "{colors.card-bg}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-padding}"
  metric-icon-wrapper:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    size: 40px
  pill-tab:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.pill}"
    padding: "{spacing.sm} 14px"
  pill-tab-active:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "{spacing.sm} 14px"
  filter-input:
    backgroundColor: "{colors.card-bg}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: 10px
  tag:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.pill}"
    padding: 2px 8px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-white}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.primary-white}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} 16px"
  button-reset:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} 16px"
  table-card:
    backgroundColor: "{colors.card-bg}"
    rounded: "{rounded.lg}"
  table-header-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-muted}"
  table-row-hover:
    backgroundColor: "{colors.table-row-hover}"
  drawer-light:
    backgroundColor: "{colors.card-bg}"
  drawer-dark:
    backgroundColor: "{colors.dark-surface}"
  toolbar:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-white}"
  section:
    backgroundColor: transparent
    padding: "{spacing.xl}"
  section-content:
    backgroundColor: transparent
    padding: "{spacing.lg}"
    rounded: "{rounded.sm}"
  card-essential:
    backgroundColor: "{colors.card-bg}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
---

## Overview

**Technical Precision meets Industrial Craftsmanship.** Stellar Nexus evokes the feeling of a well-engineered control panel — clean, functional, and purposeful. The design language draws from industrial interfaces and technical dashboards, with a warm undertone that keeps it approachable.

The brand personality is **reliable, technical, and efficient**. The UI should feel like a professional tool that gets out of the way and lets users work.

The dashboard aesthetic follows a premium B2B SaaS pattern — prioritizing clarity, calm, and trustworthiness. This is a tool used by engineers and operators who need to scan dense tabular data quickly. Every design decision serves scannability and reduces cognitive load.

### Dashboard (Authenticated)
The dashboard uses a left-drawer navigation pattern with a compact toolbar. It is dense, data-forward, and optimized for productivity. Visual weight is kept low to reduce cognitive load during extended sessions.

### Landing Page (Public)
The landing page uses a full-width header/footer layout with hero sections. It is more visually expressive, with larger typography, generous whitespace, and marketing-oriented CTAs. It should feel inviting and communicate value quickly.

Both contexts share the same color DNA, typography, and shape language. They differ in density, visual weight, and component emphasis.

## Colors

The palette is anchored in a deep technical blue with warm accent tones that create visual energy.

- **Primary (#2D4A7D):** Deep industrial blue. Used for primary actions, navigation, active states, and links. Conveys trust and technical competence. Hover state shifts to `#1E3A5F`.
- **Accent (#FF5E5B):** Coral red. Reserved for high-priority actions, alerts, and visual highlights. Use sparingly to maintain impact. Hover state shifts to `#E04E4B`.
- **Secondary Yellow (#FFED66):** Warm yellow. Used for warnings, secondary highlights, and logo accents.
- **Background (#F5F7FA):** Near-white surface for the page canvas. Provides subtle contrast against pure white cards.
- **Card BG (#FFFFFF):** Pure white for content containers. Creates clear visual hierarchy against the background.
- **Surface (#E8ECF1):** Cool slate for secondary surfaces, disabled states, and inactive elements.
- **Text hierarchy:** Primary (#1A2332) for headings, secondary (#4A5568) for body and labels, muted (#8896A6) for placeholders and captions. Three levels of text create clear information hierarchy.
- **Border (rgba(0, 0, 0, 0.08)):** Subtle separator lines. Used for cards, tables, and section dividers.
- **Positive (#2ECC71):** Custom success green. Harmonizes with the blue primary.
- **Negative (#ef4637):** Custom error red for destructive actions and error states.

**Dark mode:** The dark palette uses near-black surfaces with reduced shadow weights and adjusted border opacity for comfort. Cards use `#1E2228`, text shifts to lighter variants, and the primary accent becomes slightly brighter for contrast.

## Typography

The type system uses **Anton** for display headings — a bold, condensed sans-serif that conveys strength and technical authority. **Poppins Medium** handles body text with its geometric clarity.

- **Display & headings** use Anton for a premium, technical feel.
- **Metric values** use Anton at 24px to stand out as key data points.
- **Metric labels** use uppercase treatment with 0.05em letter-spacing for a technical, dashboard-appropriate look. Table headers follow the same pattern.
- **Body text** stays at 14px — the application is data-dense, so larger body text would waste precious viewport space. Captions and tags drop to 12px.
- **Code** uses JetBrains Mono at 14px for API examples and identifiers.

### Dashboard vs Landing Page

| Context | Display | Headline | Body |
|---------|---------|----------|------|
| **Dashboard** | 20px (compact) | 18px | 14px (readable at density) |
| **Landing page** | 24px+ (hero) | 20px | 16px (generous) |

The landing page uses Anton at full scale for impact. The dashboard tones it down — Anton is reserved for the site logo and metric values, not page titles.

## Layout & Spacing

The application uses a header + main content layout. The header is fixed at 64px height with a subtle border. Main content has 24px padding on all sides, with 16px gaps between sections.

### Dashboard
- Left drawer (mini/max states) at 260px width + main content area
- Content padding: 24px on all sides
- Unconstrained content width — data tables and charts span the available area
- Compact vertical rhythm to maximize information density
- Metric cards: 4-column grid (responsive to 2 on tablet, 1 on mobile)

### Landing Page
- Full-width header/footer with centered section content
- Sections use `sn-section` / `sn-section-content` pattern
- Generous vertical spacing between sections
- Hero area spans full viewport width with centered text overlay

### Shared
- Spacing scale: xs (4px), sm (8px), md (12px), lg (16px), xl (24px)
- Card padding: 16px
- Filter row: flex row with 12px gap, wrapping on overflow

## Elevation & Depth

Elevation uses subtle, multi-layer shadows with low opacity. No heavy drop shadows — the aesthetic is flat and calm.

- **Card shadow:** `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)` — applied to all cards and containers.
- **Elevated card:** `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)` — for cards with deeper hierarchy.
- **Card hover:** `0 8px 16px rgba(0,0,0,0.1)` — combined with `translateY(-2px)` on hover.
- **Header:** `0 1px 2px rgba(0,0,0,0.04)` — barely perceptible, just enough to separate from content.
- **Dialog/modal:** `0 20px 40px rgba(0,0,0,0.15)` — strong enough to clearly float above content.

Dark mode reduces shadow opacity for comfort.

## Shapes

Border radius follows a 3-tier system: 4px for subtle rounding, 8px for inputs and nav items, 12px for cards, 9999px for pills and badges. This creates visual consistency — small interactive elements get tighter corners, containers get softer corners, and tags/badges are always fully rounded.

### Dashboard vs Landing Page

| Element | Dashboard | Landing Page |
|---------|-----------|--------------|
| Buttons | 8px radius, compact padding | 8px radius, larger padding for visual weight |
| Cards | 12px radius, shadow-separated | 12px radius, shadow-separated |
| Inputs | 8px radius, standard height | 8px radius, taller for prominence |
| Tags/Badges | Fully rounded (pill) | Fully rounded (pill) for marketing labels |

## Components

### Navigation

**Dashboard:** Left drawer with **mini/max states**. Mini state shows icons only (50px width). Max state shows full link text with icons at 260px width. Active state uses primary color background with subtle tint. Navigation items are EssentialLink components with optional image icons (30x30px).

**Landing page:** Horizontal toolbar navigation in the header. Logo centered or left-aligned. Sign-in/Sign-up CTA buttons in the header. No drawer pattern.

### Header Toolbar

64px fixed height, white background (light mode) or dark surface (dark mode), with subtle bottom border. Contains the app title, navigation, and theme toggle.

### Metric Cards

White cards with 12px rounded corners and shadow. Colored icon in an 8px rounded container with surface background. Large bold value (24px, Anton). Muted uppercase label with wide letter-spacing.

### Pill Tabs

Flex row with 8px gap. Inactive: surface bg + muted text. Active: primary bg + white text. Each tab shows icon + label + count badge. Fully rounded corners.

### Table Cards

White card wrapper with 12px border radius and shadow. Header row has surface background with muted text. Body rows have hover state (light sky tint in light mode, custom dark variant in dark mode).

### Tags

Pill-shaped badges with surface background and colored text. Variants: primary (blue), accent (coral), warning (yellow), success (green).

### Cards

**Dashboard:** EssentialCard is the primary data container. White background with 12px rounded corners and shadow. Used for summary statistics and quick-glance data. Hover animation lifts card with translateY(-2px).

**Landing page:** Cards can be larger and more visually expressive. Use for feature highlights, testimonials, or pricing tiers. Same color tokens apply but with more padding and larger typography.

### Tables

**Dashboard only:** DefaultTable with column filtering. Filter menu has 200px minimum width. Uses elevation for separation rather than borders. Description text at 12px.

### Error Logs

**Dashboard only:** StellarErrorLog with syntax-highlighted JSON. Dark background (`#1e1e1e`) with light text (`#d4d4d4`). 16px padding for readability.

### Hero Section

**Landing page only:** Full-width banner with primary blue or gradient background. Anton display heading. Centered CTA buttons. Logo or decorative elements can be overlaid.

## Icons

- **Primary**: Quasar's built-in FontAwesome v6 (`icon="fas fa-*"`, `icon="far fa-*"`, `icon="fab fa-*"`). Already loaded in `quasar.config.js` — use first
- **Backup**: When FontAwesome lacks an icon, use `better-icons` CLI to retrieve SVGs from 150+ collections (Lucide, Heroicons, Material Design, etc.)
  - Search: `npx better-icons search <query> --prefix lucide --limit 10`
  - Get SVG: `npx better-icons get lucide:<name> --size 24`
  - Popular collections: `lucide`, `mdi`, `heroicons`, `tabler`, `ph`, `ri`
- Inline SVGs should use `fill="currentColor"` to inherit text color and support dark mode
- Do not install icon libraries as npm dependencies

## Do's and Don'ts

### Shared
- **Do** use the three-level text hierarchy (primary/secondary/muted) for information density
- **Do** use uppercase + letter-spacing for technical labels (metric labels, table headers)
- **Do** use the primary blue for all primary actions and navigation elements
- **Do** reserve the accent coral for high-priority actions and alerts
- **Do** use Anton for headings and metric values — never for body text
- **Do** apply card hover animations (translateY -2px) consistently across all card components
- **Don't** use drop shadows heavier than the defined elevation scale
- **Don't** use pure white (#ffffff) as body text on dark backgrounds — use dark-text-primary
- **Don't** overload the accent color — it loses impact when overused
- **Don't** use gradients for backgrounds — solid colors maintain the minimalist aesthetic

### Dashboard
- **Do** maintain the mini/max drawer pattern for navigation
- **Do** keep information density high — users are here to work
- **Do** use EssentialCard for summary stats and quick-glance data
- **Do** use elevation (shadows) for card separation, not borders
- **Don't** introduce large hero sections or marketing-style CTAs

### Landing Page
- **Do** use generous whitespace and larger typography for impact
- **Do** make CTAs prominent and action-oriented
- **Do** use the hero section to communicate value quickly
- **Don't** replicate the dashboard drawer pattern
- **Don't** cram data tables or dense controls into the landing page
