# Schema-driven pages: required architecture

This is a persistent project requirement from the repository owner. Every AI agent and contributor
must read this document before changing frontend pages, schemas, widgets, or rendering. Re-read it
after a handoff or context reset. Include this requirement and the affected paths in any handoff; do
not depend on chat memory.

## Ownership

`commerce-ui` owns page declarations in JSON. It must not implement page components. `dynamic-pages`
owns the implementation of all page components, their subcomponents, styles, hooks, interaction
state, rendering, and component tests.

This applies to every page, including inboxes, dashboards, and other custom workspaces, as well as
CRUD forms, lists, and detail views. A one-off or prototype is still a page and must follow the same
boundary. Never put a temporary implementation in commerce-ui with a promise to move it later.

| Location                                        | Owns                                                                                                                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `commerce-ui/src/schemas/<feature>/*.json`      | JSON Schema and UI-schema declarations: page content, data defaults, layout selection, fields, filters, actions, data-source options |
| `commerce-ui/src/features/fallbackSchemas.ts`   | Imports and declarative registration of CRUD schema documents                                                                        |
| `commerce-ui/src/root/components/AppRoutes.tsx` | Thin routing: bind JSON documents to exported library renderers                                                                      |
| `commerce-ui/src/setup`                         | App bootstrap, authentication/session and API transport adapters; never page rendering or page state                                 |
| `dynamic-pages/packages`                        | Page/component implementations, styles, state, validation, schema interpretation, rendering, and behavioral tests                    |

Application bootstrap and router composition can remain TypeScript/TSX. This exception is for wiring
the application, not for hiding a page component, callback implementation, or stylesheet in an app
shell. Extend the library when a schema needs a new capability. Do not embed JavaScript, JSX,
callbacks, or CSS implementation in JSON and evaluate it in the host.

## Existing page paths

CRUD pages keep separate `list`, `form`, and `detail` `.schema.json` and `.ui-schema.json` files.
`DynamicPage` selects views, loads schema-driven data, and renders the shared widgets. Keep these
pages on that existing path.

Standalone workspaces use the library's exported `SchemaPage`:

```tsx
import { SchemaPage } from '@dynamic-pages/layout';
import schema from '../../schemas/messaging/page.schema.json';
import uiSchema from '../../schemas/messaging/page.ui-schema.json';

// Route composition only; no page component or interaction logic in the host.
<Route path="/inbox" element={<SchemaPage schema={schema} uiSchema={uiSchema} />} />;
```

The data schema provides `title`, `description`, and `default` data. The UI schema selects a
library-owned renderer using `ui:page.component` (`inbox` or `dashboard`) and a stable `ui:page.id`.
The library validates the supported data shape before rendering. Unsupported components and
malformed data display an error instead of invoking arbitrary application code.

Inbox data defaults contain `workspace` and a paged `source` declaration. Demo mode uses sample
fixtures and local edits. API mode uses the tenant-authenticated `/api/v1/inbox` facade for live
Facebook reads, explicit replies, workspace read/resolved state, and optional AI reply drafts.
Connecting does not enable automatic replies or order actions. Credentials belong only in the
backend's encrypted connection store; never put them or customer histories into schemas or public
fixtures. See [backend messaging contracts](../../commerce-solution-be/docs/messaging.md).

Dashboard defaults contain `cards` with `id`, `title`, `description`, and `path`. The shared
renderer filters them against the application's already-filtered navigation menu. Backend
authorization remains authoritative.

## Workflow for every change

1. Read the applicable `AGENTS.md` files and this document.
2. If `.codegraph/` exists, use CodeGraph before locating or understanding implementation code. Do
   not index a repository without the owner's instruction.
3. Change commerce-ui JSON declarations when the library already supports the desired capability.
4. Otherwise implement and test that capability in dynamic-pages, export it through a public library
   entry, then reference it from JSON. Do not import host code into the library or reach into
   library internals from commerce-ui.
5. Keep page behavior and component tests in the library. Keep schema declaration and
   architecture-boundary tests in commerce-ui.
6. Run the affected checks and report pre-existing failures separately. Do not claim that
   documentation can force unrelated tools to remember a rule; the tracked instructions and tests
   are the persistence mechanism.

The commerce-ui `pageArchitecture.test.ts` check rejects component implementations and styles under
`src/features` and `src/pages`, and prevents local page components from being routed directly. Keep
this check enabled and extend it when introducing new declaration locations. Do not weaken it to
accommodate a page implementation in commerce-ui.

## Internationalization (required)

All user-facing UI text must use the existing i18next/react-i18next system. This includes page and
schema titles, navigation, buttons, labels, placeholders, tooltips, validation and error messages,
empty/loading states, notifications, accessibility labels, and document titles. Store wording in
translation catalogs and reference stable keys from components and JSON schemas. Use interpolation
and locale-aware plural/date/number formatting; do not concatenate sentences, use English display
text as control values, or embed English fallback copy in components. Keep customer messages, names,
handles, and business data as data. Add keys for supported locales and test language switching.
Preserve the schema-only commerce-ui/shared-component boundary. Read the architecture document
before editing and carry this requirement into handoffs.

Standalone page titles, descriptions, and dashboard card copy are translation keys. Shared workspace
strings are registered under `workspace`; app-specific labels are registered under `commerceUI`.
Register the exported `WORKSPACE_TRANSLATIONS` in the host i18next resources. Conversation
topics/intents are keyed metadata; customer text, AI response content, and store/customer names
remain unmodified data.

Merge the public common entry's `COMMON_UI_TRANSLATIONS` into the host's `common` namespace for
generic widget labels. The i18n architecture test scans commerce-ui and shared library JSX for
literal UI copy, verifies locale key parity, and checks standalone schema translation keys.
`AppDrawer.title` intentionally accepts a translation key that its renderer resolves.

## Schema layout and lazy messaging

Application JSON page schemas live in `commerce-ui/src/schemas/<feature>/`, separate from feature
declarations, shared components, and data. Shared schema types and validation live under
`packages/layout/src/schema-page/schemas/`. Do not embed message histories in page schemas.

The inbox, history view, assistant panel, and dashboard use separate lazy code chunks. Conversation
summaries are paged independently from histories. Selecting a conversation requests only its
messages. Older history loads on demand, and obsolete requests are cancelled. The loader retains at
most 500 summaries, 10 thread caches, and 200 messages per thread. When loading older history
replaces newer messages, the user can return to the latest window. Demo replies and resolutions
remain local to the session across filter changes.

The source declares `mode`, `url`, `pageSize`, and `messagePageSize`. Demo mode reads separate paged
HTTP fixtures under `public/demo/messaging`. Live API mode points to `/api/v1/inbox` and uses
explicit authenticated reply/status actions. Missing permissions and load failures stay visible
rather than silently showing demo data. Keep connection settings in a lazy shared component and
keep AI drafting disabled when no real provider is configured.
