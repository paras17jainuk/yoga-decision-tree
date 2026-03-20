# Yoga Decision Tree — Design Brainstorm

<response>
<text>
## Idea 1: "Zen Garden" — Japanese Minimalism meets Digital Wellness

**Design Movement:** Wabi-Sabi / Japanese Minimalism — embracing imperfection, natural beauty, and the meditative quality of empty space.

**Core Principles:**
1. Ma (間) — the art of negative space as a design element, not emptiness
2. Organic asymmetry — layouts that feel natural, not grid-locked
3. Tactile warmth — textures that evoke natural materials (stone, paper, wood grain)
4. Progressive revelation — information unfolds gently, never overwhelming

**Color Philosophy:** A palette inspired by a zen garden at dawn. Warm stone (oklch 0.92 0.02 80) as the base, deep charcoal ink (oklch 0.25 0.01 60) for text, sage green (oklch 0.65 0.08 145) as the primary accent representing growth and healing, and a muted terracotta (oklch 0.62 0.12 45) for warnings/contraindications. The palette should feel like looking at a Japanese ink painting.

**Layout Paradigm:** Vertical scroll storytelling with generous breathing room. The decision tree unfolds like an unrolling scroll — each question appears as a standalone "card" floating in space with ample margins. Results are presented in a split layout: left column for recommended (with sage green accents), right column for contraindicated (with terracotta accents).

**Signature Elements:**
1. Ink-wash transitions — sections fade in with a watercolor-dissolve effect
2. Enso (circle) motifs — incomplete circles used as decorative elements and progress indicators
3. Subtle paper texture overlay on backgrounds

**Interaction Philosophy:** Slow and intentional. Selections ripple outward like a stone dropped in water. Transitions are unhurried (400-600ms). The interface rewards patience and mindfulness, mirroring the yoga practice itself.

**Animation:** Fade-up entrances with slight parallax. Cards float in with a gentle rise (translateY 20px → 0). Progress through the decision tree is animated like turning pages. Hover states reveal subtle depth through shadow expansion.

**Typography System:** DM Serif Display for headings (elegant, warm serifs), Source Sans 3 for body text (clean, highly readable). Large heading sizes (3rem+) with generous line-height (1.6). Body text at 1.125rem for comfortable reading.
</text>
<probability>0.07</probability>
</response>

<response>
<text>
## Idea 2: "Clinical Clarity" — Swiss Design meets Health Tech

**Design Movement:** Neo-Swiss / International Typographic Style — precision, clarity, and information hierarchy as the primary design tool.

**Core Principles:**
1. Information density without clutter — every pixel serves a purpose
2. Typographic hierarchy as navigation — size, weight, and spacing guide the eye
3. Data-first design — the yoga data IS the visual interest
4. Systematic color coding — conditions, recommendations, and warnings have distinct visual languages

**Color Philosophy:** A clinical yet warm palette. Pure white (#FAFAFA) background with a deep navy (oklch 0.28 0.05 260) for primary text. A vibrant teal (oklch 0.60 0.15 185) for recommended/safe elements, warm amber (oklch 0.72 0.15 70) for caution, and a clear red (oklch 0.55 0.20 25) for contraindicated. The palette communicates medical trustworthiness while remaining approachable.

**Layout Paradigm:** Dense, information-rich dashboard layout. The decision tree uses a left sidebar for navigation/progress, a wide center column for the current question, and a persistent right panel showing a running summary of selections. Results are displayed in a structured table/card hybrid with filterable columns.

**Signature Elements:**
1. Monospace condition codes — each condition gets a short code displayed in a pill badge
2. Traffic-light indicators — green/amber/red dots next to every asana based on user's conditions
3. Horizontal rule separators with condition labels

**Interaction Philosophy:** Efficient and direct. Click targets are large and obvious. Multi-select checkboxes with instant visual feedback. The interface respects the user's time — no unnecessary animations or decorative flourishes.

**Animation:** Minimal and functional. 150ms transitions for state changes. Accordion expansions for detailed information. No entrance animations — content is immediately available.

**Typography System:** Space Grotesk for headings (geometric, modern), IBM Plex Sans for body (designed for readability at all sizes). Strict modular scale (1.25 ratio). Heavy use of font-weight variation (300, 400, 600, 700) for hierarchy.
</text>
<probability>0.05</probability>
</response>

<response>
<text>
## Idea 3: "Earth & Breath" — Organic Modernism meets Wellness

**Design Movement:** Organic Modernism — blending natural, flowing forms with clean modern structure. Inspired by the connection between body, earth, and breath.

**Core Principles:**
1. Flowing forms — rounded shapes, organic curves, and soft edges that mirror the body in motion
2. Grounded warmth — earthy tones that feel nurturing and trustworthy
3. Layered depth — overlapping elements, soft shadows, and glass-morphism create a sense of dimension
4. Guided journey — the interface feels like a conversation with a knowledgeable yoga teacher

**Color Philosophy:** Inspired by a forest floor at golden hour. Deep forest green (oklch 0.35 0.08 155) as the primary brand color, warm cream (oklch 0.96 0.02 90) as the base, soft terracotta (oklch 0.68 0.10 50) for accents and CTAs, muted gold (oklch 0.78 0.10 85) for highlights, and a dusty rose (oklch 0.72 0.08 15) for gentle warnings. The palette evokes natural healing and grounded energy.

**Layout Paradigm:** Full-screen step-by-step wizard with organic card shapes. Each step of the decision tree takes the full viewport with a large, centered question and visually distinct option cards arranged in a flowing, non-grid pattern (staggered, slightly rotated). Results are presented in an elegant two-panel layout with smooth scroll — "Your Practice" (recommended) and "Proceed with Caution" (contraindicated).

**Signature Elements:**
1. Organic blob shapes as background decorations — soft, amorphous forms that shift subtly
2. Breath-synchronized micro-animations — elements pulse gently at a 4-second breathing rhythm
3. Gradient mesh backgrounds that shift between warm earth tones

**Interaction Philosophy:** Warm and conversational. Options feel like they're being offered by a friend. Selections trigger a satisfying "embrace" animation (card slightly scales up and gains a warm glow). The journey through the tree feels like a guided meditation.

**Animation:** Smooth, flowing transitions (500ms ease-out). Cards enter with a gentle scale-up from 0.95 to 1.0 with opacity fade. Background blobs drift slowly. Page transitions use a soft cross-fade. Hover states add a warm glow effect.

**Typography System:** Fraunces for headings (soft, organic serifs with optical sizing), Plus Jakarta Sans for body (modern, friendly, excellent readability). Headings are large and expressive (2.5-4rem). Body text is generous (1.125rem) with relaxed line-height (1.7).
</text>
<probability>0.08</probability>
</response>
