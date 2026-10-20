# GTM Portfolio website

This directory is the source of the portfolio website embedded in Framer.

## Source of truth

- `app/globals.css` contains the visual design and responsive styling.
- `app/work-data.ts` contains the Types of Work content.
- `scripts/build-netlify-embed.mjs` generates the static multipage website deployed by Netlify.
- `public/` contains permanent public assets and Framer reference exports.

## Build locally

Install the package dependencies, then run:

```bash
node scripts/build-netlify-embed.mjs
```

The deployable output is generated at:

```text
handoff/GTM-Portfolio-Netlify-Drop/
```

Do not edit the generated HTML directly. Make changes in the source files and rebuild it. Netlify uses the repository-level `netlify.toml` to run this build automatically.

The public contact email, LinkedIn URL, location, and remaining personal placeholders must be replaced before launch.
