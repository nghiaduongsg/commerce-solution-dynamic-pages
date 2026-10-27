# Dynamic Pages

Reusable schema-driven React pages, forms, layouts, authentication and themes.

## Generic API migration

- Use AppProvider from core.initialization, AuthProvider from setup, DynamicThemeProvider from theme, and DynamicPage from layout.
- Page components and their props use the Page prefix. The layout metadata hook is usePageLayout.
- DynamicPage accepts layout="standard" (default) or layout="self-service". AppProvider accepts selfService (default false) and a host-defined systemUsed identifier.
- The default theme key is default. Host themes, logos and banners remain configurable.
- System.contextTokenHeader selects the entity-save context header; the default is X-Context-Token. Configure the server to accept the same header.
- AccessibilityPage accepts title and children. Supply your application's own statement, audit findings and contact details.
- Attachment schemas use Shared/Attachments as their default document folder.
- Publishing uses the caller's npm registry configuration.

These exported name changes require updates in consuming applications.

## Validation

Run npm run build, npm run typecheck, and npm test.
