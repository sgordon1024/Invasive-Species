# Invasive Species Brewing

- **Website** — this folder (React + Vite), Beer Passport in `src/passport/` (see `BEER_PASSPORT_README.md`)
- **Ops platform** — `platform/` (liquor sales & inventory)
- **Menagerie iOS app** — `ios/Menagerie/`: AR taxidermy stories + 24-hour bar notes, geofenced to the taproom (see `ios/Menagerie/README.md`)
- **Supabase** — `supabase/` (schema, migrations, edge functions)

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
