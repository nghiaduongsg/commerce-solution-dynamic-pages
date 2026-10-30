# Required reading for AI agents

Before any frontend page, schema, widget, or component change, read and follow
[the schema-driven page architecture](docs/schema-driven-pages.md). This is a persistent owner
requirement, including during prototypes and after handoffs.

- `commerce-ui` page definitions must contain JSON schemas, not component implementations.
- Implement all page components, subcomponents, styles, rendering, state, and behavior in this
  library `dynamic-pages`.
- Export shared capabilities publicly; never import commerce-ui code into this library.
- Preserve this requirement in handoffs. Read the document again after context resets rather than
  relying on chat memory.

## CodeGraph

If a repository has `.codegraph/`, use `codegraph_explore` (or `codegraph explore`) before grep/find
or reading implementation code. Skip CodeGraph when no index exists; do not create an index without
instruction.

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

## Schema organization and messaging performance

Keep app page JSON under `commerce-ui/src/schemas/<feature>/` and shared schema types/validation in
the library's schemas subfolder. Load messaging code and data on demand, page summaries separately
from histories, cancel obsolete requests, and bound message/thread caches. Do not put histories into
page schemas.
