# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Employers / Recruiters** (primary): Hiring managers, engineers, and engineering managers scanning for "should I interview or hire this person?" They evaluate technical range, shipping habit, and cultural fit.
- **Collaborators / Fellow Builders:** Developers and makers who browse to assess technical curiosity, evaluate potential collaboration on side projects, or admire shipped work.
- **Akshat (personal / creative outlet):** The site doubles as a creative journal and digital portfolio, a place to document the ongoing journey.

## Product Purpose

A personal portfolio website that showcases Akshat Sharma's range across hardware, embedded systems, PCB design, mobile apps, and games. The site is both a professional landing page for employer attention and a personal creative expression: an experimental visual identity built around a "cursor-reactive ink terrain" rendered with ASCII, ocean-like moving elements, and organic motion.

## Positioning

Akshat's range across hardware and software is what a neighboring portfolio couldn't truthfully copy. From a home-brewed StreamDeck to PCB designs to Flutter apps that ship, the site documents a builder who touches physical things, not just pixels. The experimental ocean visual identity (ASCII-based, cursor-reactive, alive with motion) is itself a piece of the positioning: a portfolio that demonstrates engineering curiosity through its form, not just its content.

## Operating Context

- The site is statically built with Next.js and deployed on **Vercel**.
- Blog content lives as Markdown files in the `pages/blog` route, processed with gray-matter and remark.
- GitHub profile data is fetched dynamically (stats, Spotify tracks, animated ocean background).
- GitHub projects and repos are fetched via API routes (`pages/api/github-projects.js`).
- The dev server runs `npm run dev` for local development.

## Capabilities and Constraints

- **Confirmed capabilities:** Projects showcase, photography gallery, experience timeline, blog with Markdown support, animated GitHub profile GIF generator, cursor-reactive ASCII terrain.
- **Undecided:** Blog content exists as a route with Markdown support but specific posts are minimal; future work must populate it.
- **Undecided:** No testimonials, press, or third-party evidence artifacts currently available.
- **Known constraint:** The site is visually complex (WebGL / Three.js, framer-motion, ASCII canvas). Performance and load time on the home page must be managed.

## Brand Commitments

- **Voice:** Professional but approachable, technical but never dry.
- **Name / identity:** "Akshat Sharma" / "akshat.ssh" (consistent across site, structured data, and social channels).
- **Visual identity:** Warm organic ink palette (dark theme, `--bg: #0d0a08`, bone text, muted warm accents). Typography: Endless (display), Newsreader (body/sans-serif), JetBrains Mono (code). Color palette defined in `styles/globals.css` and mirrored in `tailwind.config.cjs`.
- **Assets to preserve:**
  - Favicon at `/images/icon.ico`
  - Portrait photo at `/images/ascii/real_pfp.jpg`
  - Font files including Endless at `/font/endless.ttf`

## Evidence on Hand

- Social links: GitHub (ItsAkshatSh), Instagram (akshat.ssh), LinkedIn (akshat404)
- Structured data (Schema.org Person + WebSite) in `pages/_app.jsx`
- Open Graph and Twitter card meta tags
- README documenting ongoing to-dos (accessibility, lazy loading)
- No testimonials, press, or third-party evidence currently available. Future work must not fabricate these.

## Product Principles

1. **Show range, not just stories.** Let the breadth of work (hardware → software → embedded → games → photography) speak for itself.
2. **The form is the argument.** The portfolio's visual identity (ASCII ocean, cursor-reactive terrain) demonstrates engineering curiosity, not just describing it.
3. **Professional but warm.** Tone is approachable, not corporate. Technical depth without academic stiffness.
4. **Ship real things.** Not hypothetical projects or toy code. StreamDeck clones, shipped Flutter apps, real PCB designs.
5. **Performance is craft.** A visually complex site must still load, scroll, and interact well.

## Accessibility & Inclusion

- **Target:** WCAG 2.1 AA compliance.
- **Known efforts:** `MotionConfig` with `reducedMotion="user"` respects the OS reduced motion preference. Semantic HTML structure used in components. Focus management is noted as a to-do (focusTrap exists but README calls out keyboard navigation gaps).
- **Gaps:** Keyboard navigation for the lightbox is noted as a to-do in README. Focus management across the SPA router needs verification.
