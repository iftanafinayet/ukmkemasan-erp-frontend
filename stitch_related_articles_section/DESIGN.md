---
name: Cyan Logic
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3e494b'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6e797c'
  outline-variant: '#bdc9cc'
  surface-tint: '#006877'
  primary: '#006877'
  on-primary: '#ffffff'
  primary-container: '#4fb8cc'
  on-primary-container: '#004650'
  inverse-primary: '#6fd5e9'
  secondary: '#4d6169'
  on-secondary: '#ffffff'
  secondary-container: '#d0e6ef'
  on-secondary-container: '#53676f'
  tertiary: '#5b5f60'
  on-tertiary: '#ffffff'
  tertiary-container: '#a7abac'
  on-tertiary-container: '#3b4041'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a3eeff'
  primary-fixed-dim: '#6fd5e9'
  on-primary-fixed: '#001f25'
  on-primary-fixed-variant: '#004e5a'
  secondary-fixed: '#d0e6ef'
  secondary-fixed-dim: '#b4cad3'
  on-secondary-fixed: '#091e25'
  on-secondary-fixed-variant: '#364a51'
  tertiary-fixed: '#e0e3e4'
  tertiary-fixed-dim: '#c4c7c8'
  on-tertiary-fixed: '#181c1d'
  on-tertiary-fixed-variant: '#434748'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1200px
  article-width: 720px
  gutter: 24px
  margin-mobile: 16px
  section-gap: 80px
---

## Brand & Style
The design system is built on a foundation of **Modern Minimalism** with a focus on editorial clarity. It is designed for professional B2B audiences and entrepreneurs who value efficiency and trustworthy information. 

The visual narrative uses generous whitespace to create a "breathable" interface, allowing high-quality imagery and typography to take center stage. The aesthetic is clean and organized, utilizing soft container backgrounds and precise accent placements to guide the user's eye through long-form content without cognitive fatigue. The overall mood is optimistic, professional, and systematically structured.

## Colors
The palette is dominated by a clean white base, supported by high-utility neutrals and a vibrant cyan accent.

- **Primary (#4FB8CC):** Used sparingly for high-intent actions, active navigation states, and informational badges. It provides a fresh, modern energy.
- **Secondary (#1A2E35):** A deep charcoal used for primary headings and body text to ensure maximum readability and a professional "weighted" feel.
- **Tertiary (#F4F7F8):** A soft, cool gray used for large background containers and subtle section differentiation.
- **Neutral (#64748B):** A mid-tone slate used for secondary metadata, descriptions, and borders to maintain hierarchy.

## Typography
The system employs a dual-font approach to balance personality with utility. **Plus Jakarta Sans** provides a modern, friendly geometric feel for headlines, while **Inter** ensures highly legible reading experiences for long-form article content.

For article details, use `body-lg` for the lead paragraph to provide a comfortable entry point, followed by `body-md` for the standard narrative. All labels and overlines must use `label-sm` with increased letter spacing to clearly distinguish metadata from content.

## Layout & Spacing
The layout uses a **Fixed Grid** philosophy for content readability. While the shell is fluid, the article content is restricted to a 720px centered column to optimize line lengths for reading.

- **Desktop:** 12-column grid. Main content spans the central 8 columns for articles, or a full-width section for landing headers.
- **Tablet:** 8-column grid with 32px side margins.
- **Mobile:** 4-column grid with 16px side margins. 

Spacing follows an 8px base unit. Section gaps are kept generous (80px+) to maintain the minimalist, airy brand feel.

## Elevation & Depth
Depth is created through **Tonal Layers** rather than heavy shadows. 

1. **Base Layer:** Pure White (#FFFFFF) for the main page background.
2. **Sub-surface:** Light Gray (#F4F7F8) containers with large corner radii to group related content blocks (like "More Articles" sections).
3. **Floating Elements:** Only primary cards and the "WhatsApp" floating action button use **Ambient Shadows**. These shadows are extremely soft (Blur: 20px, Opacity: 4%) with a slight neutral tint to avoid a "dirty" look.
4. **Interactive States:** Buttons and input fields use low-contrast outlines (1px solid #E2E8F0) that transition to the primary cyan on focus.

## Shapes
The shape language is "Soft-Modern." It avoids the clinical feel of sharp corners in favor of approachable, rounded forms.

- **Standard Elements:** Buttons and small cards use 0.5rem (8px).
- **Featured Containers:** Large background sections and main article cards use 1.5rem (24px) to create a distinct, friendly frame.
- **Badges:** Use a fully pill-shaped (999px) radius to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid Cyan (#4FB8CC) with white text. High roundedness (0.5rem).
- **Secondary:** Outline variant with 1px border of Primary color and Primary color text.
- **Ghost:** No background or border, Primary color text. Used for "Read More" or "Back" actions.

### Cards
Article cards should feature a large image with a 1.5rem radius at the top. The typography inside cards follows a strict hierarchy: `label-sm` (Category), `headline-md` (Title), and `body-md` (Snippet).

### Badges/Chips
Informational chips (e.g., "Informasi Menarik") use the Primary color background with white text, uppercase `label-sm` typography, and pill-shaped corners. They should have generous horizontal padding (16px).

### Input Fields
Clean, minimal inputs with a 1px #E2E8F0 border. On focus, the border shifts to Primary Cyan with a subtle 2px outer glow of the same color at 10% opacity.

### Article Elements
- **Blockquotes:** Use a 4px left-border of Primary Cyan with `body-lg` italicized text.
- **Images:** All article images must carry a 1rem (16px) border radius to match the design system's softness.