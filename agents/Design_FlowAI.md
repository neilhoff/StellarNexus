---
name: FlowAI
colors:
  primary: "#0EA5E9"
  primary-hover: "#0284C7"
  success: "#10B981"
  warning: "#F59E0B"
  danger: "#EF4444"
  background: "#F8FAFC"
  card-bg: "#FFFFFF"
  surface: "#F1F5F9"
  border: "#E2E8F0"
  text-primary: "#0F172A"
  text-secondary: "#64748B"
  text-muted: "#94A3B8"
  dark-background: "#0F172A"
  dark-card-bg: "#1E293B"
  dark-border: "#334155"
  dark-text-primary: "#F1F5F9"
  dark-text-secondary: "#94A3B8"
  dark-nav-active-bg: "#1E3A5F"
  dark-nav-active-text: "#38BDF8"
  dark-table-row-hover: "#1a2537"
  table-row-hover: "#F0F9FF"
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 700
    lineHeight: 32px
    letterSpacing: "-0.01em"
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: 600
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0.05em
  metric-value:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 700
    lineHeight: 32px
  metric-label:
    fontFamily: Inter
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
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
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
  model-detail-dialog:
    backgroundColor: "{colors.card-bg}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  code-block:
    backgroundColor: "{colors.dark-card-bg}"
    textColor: "{colors.dark-text-primary}"
    rounded: "{rounded.md}"
    padding: 14px
  pricing-badge-success:
    backgroundColor: "{colors.success}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
  pricing-badge-warning:
    backgroundColor: "{colors.warning}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
  pricing-badge-danger:
    backgroundColor: "{colors.danger}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
  tag-private:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
  tag-beta:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.warning}"
    rounded: "{rounded.pill}"
  tag-deprecated:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.danger}"
    rounded: "{rounded.pill}"
  tag-capability:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.success}"
    rounded: "{rounded.pill}"
---

## Overview

FlowAI is a premium B2B SaaS dashboard aesthetic. It draws inspiration from Linear, Vercel, Notion, and Arc Browser â€” prioritizing clarity, calm, and trustworthiness. This is a tool used by engineers and operators who need to scan dense tabular data quickly. Every design decision serves scannability and reduces cognitive load.

The application is a model browser for Venice AI â€” it displays 100+ models across 8 categories (text, image, video, music, TTS, ASR, embedding, inpaint) with pricing, privacy flags, capabilities, and benchmark scores. The interface must handle this density gracefully.

## Colors

- **Primary (#0EA5E9):** Sky blue â€” the sole interactive accent. Used for active states, links, and primary actions. Chosen for high contrast against both light and dark backgrounds while feeling professional, not playful.
- **Primary Hover (#0284C7):** Darker sky blue for hover states on primary buttons and interactive elements.
- **Success (#10B981):** Emerald green â€” positive indicators, active badges, and capability tags (vision, code, function calling, video, audio).
- **Warning (#F59E0B):** Amber â€” beta flags, deprecated models, reasoning/offline tags, and mid-tier pricing indicators.
- **Danger (#EF4444):** Red â€” errors, deprecated tags, and high-tier pricing warnings.
- **Background (#F8FAFC):** Near-white slate for the page canvas. Provides subtle contrast against pure white cards.
- **Card BG (#FFFFFF):** Pure white for content containers. Creates clear visual hierarchy against the background.
- **Surface (#F1F5F9):** Slate-100 for secondary surfaces, disabled states, and inactive pill tabs.
- **Text hierarchy:** Primary (#0F172A) for headings, secondary (#64748B) for body and labels, muted (#94A3B8) for placeholders and captions. Three levels of text create clear information hierarchy without needing weight changes alone.

**Dark mode:** Full palette inversion using slate-900 (#0F172A) as background, slate-800 (#1E293B) as cards, and sky-400 (#38BDF8) as the dark-mode primary. The dark mode is not just inverted colors â€” shadow weights and border opacity are reduced for comfort.

## Typography

Inter is used universally â€” loaded from Google Fonts at weights 400, 500, 600, 700. JetBrains Mono is used exclusively for code blocks and model IDs.

- **Display & headings** use weight 700 with tight letter-spacing (-0.01em) for a premium feel.
- **Metric values** (counters) use weight 700 at 24px to stand out as key data points.
- **Metric labels** use uppercase treatment with 0.05em letter-spacing for a technical, dashboard-appropriate look. Table headers follow the same pattern.
- **Body text** stays at 14px â€” the application is data-dense, so larger body text would waste precious viewport space. Captions and tags drop to 12px.
- **Code** uses JetBrains Mono at 14px for API examples and model identifiers.

## Layout & Spacing

The application uses a header + main content layout. The header is fixed at 64px height with a subtle border. Main content has 24px padding on all sides, with 16px gaps between sections.

- **Metric cards** use a 4-column grid (responsive to 2 on tablet, 1 on mobile). Each card: icon + metric value + label.
- **Pill tabs** are a flex row with 8px gap, 8 category tabs with icon + label + count badge.
- **Filter row** is a flex row with 12px gap, wrapping on overflow. Search (220px min), privacy select (130px min), checkboxes. Right-aligned: reset button + result count chip.
- **Tables** are the primary content. Each model category gets its own table card. Tables are full-width within the card container.

## Elevation & Depth

Elevation uses subtle, multi-layer shadows with low opacity. No heavy drop shadows â€” the aesthetic is flat and calm.

- **Card shadow:** `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)` â€” applied to all cards and containers.
- **Elevated card:** `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)` â€” for cards with deeper hierarchy.
- **Card hover:** `0 8px 16px rgba(0,0,0,0.1)` â€” combined with `translateY(-2px)` on hover.
- **Header:** `0 1px 2px rgba(0,0,0,0.04)` â€” barely perceptible, just enough to separate from content.
- **Dialog/modal:** `0 20px 40px rgba(0,0,0,0.15)` â€” strong enough to clearly float above content.

## Shapes

Border radius follows a 3-tier system: 8px for inputs and nav items, 12px for cards, 9999px for pills and badges. This creates visual consistency â€” small interactive elements get tighter corners, containers get softer corners, and tags/badges are always fully rounded.

## Components

**Header Toolbar:** 64px fixed height, white background, primary text. Contains the app title, navigation, and theme toggle.

**Metric Cards:** White cards with 12px rounded corners and shadow. Colored icon in an 8px rounded container with surface background. Large bold value (24px, weight 700). Muted uppercase label with wide letter-spacing.

**Pill Tabs:** Flex row with 8px gap. Inactive: surface bg + muted text. Active: primary bg + white text. Each tab shows icon + label + count badge. Fully rounded corners.

**Filter Row:** White outlined inputs with 8px rounded corners. Right-aligned reset button (surface bg) + result count chip.

**Table Cards:** White card wrapper with 12px border radius. Header row has surface background with muted text. Body rows have hover state (sky-50 in light mode, custom dark variant in dark mode).

**Tags:** Pill-shaped badges with surface background and colored text. Four variants: private (primary blue), beta (warning amber), deprecated (danger red), capability (success green).

**Model Detail Dialog:** Centered modal with backdrop, slideDown+fadeIn animation. White card with 12px rounded corners and shadow. Structured sections: pricing, description, capabilities, specs, context window, latency, benchmark scores, API endpoints.

**Code Blocks:** Dark slate background (#1E293B), monospace font, 8px rounded corners, with copy button.

**Pricing Badges:** Pill-shaped badges with solid color fill and white text. Three tiers: success green for low pricing, warning amber for mid-tier, danger red for premium pricing.

## Do's and Don'ts

- **DO** use the three-level text hierarchy (primary/secondary/muted) for information density
- **DO** use uppercase + letter-spacing for technical labels (metric labels, table headers)
- **DO** use token references in components (`{colors.primary}`) â€” never hardcode hex values in component definitions
- **DO** apply card hover animations (translateY -2px) consistently across all card components
- **DO** use UTC for all date display â€” users are globally distributed
- **DON'T** use more than one accent color â€” primary sky blue is the only interactive color
- **DON'T** increase body font size beyond 14px â€” the app is data-dense and viewport space is precious
- **DON'T** use gradients for backgrounds â€” solid colors maintain the minimalist aesthetic
- **DON'T** use heavy shadows â€” all elevation uses subtle, multi-layer shadows with low opacity