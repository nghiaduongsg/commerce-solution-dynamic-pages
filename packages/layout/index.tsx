export { default as DynamicPage } from './src/common/DynamicPage';
export { default as PageButtons } from './src/common/PageButtons';
export { default as PageInfo } from './src/common/PageInfo';
export { default as PageHighlightData } from './src/common/PageHighlightData';
export { default as PageCategory } from './src/common/PageCategory';
export { default as PageTitle } from './src/common/PageTitle';
export { default as PageContent } from './src/common/PageContent';
export { default as PageContainer } from './src/common/PageContainer';
export { default as usePageLayout } from './src/common/hooks/usePageLayout';
export { default as usePageAnnounce } from './src/common/hooks/usePageAnnounce';
export { registerIconResolver } from './src/common/utils';

export { default as SchemaPage } from './src/schema-page/SchemaPage';
export type { SchemaPageProps } from './src/schema-page/SchemaPage';
export { AuthActionError, AuthAdapterProvider } from './src/schema-page/auth/AuthAdapter';
export type { AuthAdapter, AuthErrorCode } from './src/schema-page/auth/AuthAdapter';

export { WORKSPACE_TRANSLATIONS } from './src/schema-page/translations';
