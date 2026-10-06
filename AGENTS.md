# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project

"Godimento Banca Ore" is a Tauri 2 desktop app (React 19 + TypeScript + Vite + Tailwind 4) for Italian payroll offices. It reads an XML attendance export (`Fornitura > Dipendente > Movimenti > Movimento`), and generates a new XML of "banca ore" movements that top each employee up to their weekly contracted hours. The domain language (types, fields, comments, UI strings) is Italian; keep it that way.

## Commands

Package manager is **pnpm**.

- `pnpm tauri dev` — run the desktop app (starts Vite on port 1420 via `beforeDevCommand`)
- `pnpm dev` — Vite only; Tauri APIs (`fs`, `dialog`, `path`) will not work in a plain browser
- `pnpm tauri build` — production bundle
- `pnpm build` — `tsc` typecheck + Vite build (this is the typecheck step)
- `pnpm lint` / `pnpm lint:fix` — ESLint over `src`
- `pnpm format` — Prettier (printWidth 100, double quotes, trailing commas)

There is no test suite. ESLint uses the Babel parser and disables `no-unused-vars`/`no-undef`, relying on `tsc` (strict, `noUnusedLocals/Parameters`) for those — run `pnpm build` to catch type errors.

## Architecture

All business logic lives in the frontend. The Rust side (`src-tauri/src/lib.rs`) only registers plugins (`fs`, `dialog`, `opener`). File-system access is granted via `src-tauri/capabilities/default.json` — new fs operations may need permissions added there.

**Data flow** (`src/views/File.tsx`, route `/file?path=...`):
1. `utils/fileUtils.ts` parses the XML with `fast-xml-parser` (`@_` attribute prefix; `Movimento` forced to always be an array).
2. `utils/bancaOre.ts`: `derivePeriod` computes the period (Monday of the first movement's week → first weekly boundary past one month), `collectFileCodes` gathers justification codes, the user picks which codes count as worked time, then `buildBancaOreFile` produces the output.
3. Per employee, `buildMovimenti` buckets minutes by week/day (respecting hire/termination dates from the company config), then fills each day Mon→Sun up to `weeklyHours/5` until the weekly total is reached. Note the date arithmetic uses `getDay` (0 = Sunday) with an offset mapping — be careful when touching it.
4. The result is written back with `XMLBuilder` and the path is added to the history.

**Persistence**: `hooks/usePersistedJsonFile.ts` is the generic hook that stores JSON in `appLocalDataDir()` (merging saved data over defaults). It backs:
- `useAppConfig` → `config.json` (date formats, banca ore code, default weekly hours, `includeZeroDays`)
- `useCompaniesFile` → `companies.json`, a `CompanyConfig` keyed by company code → employees keyed by employee code. It is populated by importing a CSV (`types/CompanyCSVEntry.ts` defines the expected Italian column headers) on the Companies page.
- `useFileHistory` (in `useRecentFiles.ts`) → `file_history.json`, last 10 files

**Routing**: `main.tsx` defines a `createBrowserRouter` tree under `layout/Layout.tsx` (Navbar + outlet).

**i18n**: `i18next` with only `src/locales/it/translation.json`. Some views use `useTranslation`, but many strings (especially dialog messages in hooks) are hardcoded Italian.

**Imports**: use the `@/` alias for `src/` (configured in `tsconfig.json`, resolved by Vite via `resolve.tsconfigPaths`).

**Versioning**: the app version is defined in `package.json` (read by `tauri.conf.json` via `"version": "../package.json"`) and must be kept in sync manually with `src-tauri/Cargo.toml`.
