import React, { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import LazyBoundary from './LazyBoundary';
import { isAuthData } from './schemas/auth';
import { isAhamoveData } from './schemas/ahamove';
const Ahamove = lazy(() => import('./Ahamove'));
import { isDashboardData, isInboxData } from './schemas/pageDefinitions';
import { isOrderBoardData } from './schemas/board';
import usePageAnnounce from '../common/hooks/usePageAnnounce';
const Inbox = lazy(() => import(/* webpackChunkName: "messaging-inbox" */ './Inbox'));
const Dashboard = lazy(() => import(/* webpackChunkName: "workspace-dashboard" */ './Dashboard'));
const OrderBoard = lazy(() => import(/* webpackChunkName: "workspace-board" */ './OrderBoard'));
const AuthPage = lazy(() => import(/* webpackChunkName: "workspace-auth" */ './AuthPage'));

/** Standalone workspaces have no entity CRUD lifecycle. The host supplies JSON only. */
export type SchemaPageProps = {
  schema: { title: string; description?: string; default?: unknown };
  uiSchema: { 'ui:page': { id: string; component: string } };
};

export default function SchemaPage({ schema, uiSchema }: SchemaPageProps) {
  const { t } = useTranslation('workspace');
  usePageAnnounce(t(schema.title));
  const component = uiSchema['ui:page'].component;
  const data = schema.default;
  if (component === 'auth' && isAuthData(data)) {
    return (
      <LazyBoundary>
        <Suspense fallback={<div role="status">{t('loadingWorkspace')}</div>}>
          <AuthPage
            key={uiSchema['ui:page'].id}
            title={schema.title}
            description={schema.description}
            data={data}
          />
        </Suspense>
      </LazyBoundary>
    );
  }
  if (component === 'ahamove' && isAhamoveData(data)) {
    return (
      <LazyBoundary>
        <Suspense fallback={<div role="status">{t('loadingWorkspace')}</div>}>
          <Ahamove title={schema.title} description={schema.description} data={data} />
        </Suspense>
      </LazyBoundary>
    );
  }
  if (component === 'inbox' && isInboxData(data)) {
    return (
      <LazyBoundary>
        <Suspense fallback={<div role="status">{t('loadingWorkspace')}</div>}>
          <Inbox
            key={uiSchema['ui:page'].id}
            title={schema.title}
            description={schema.description}
            data={data}
          />
        </Suspense>
      </LazyBoundary>
    );
  }
  if (component === 'dashboard' && isDashboardData(data)) {
    return (
      <LazyBoundary>
        <Suspense fallback={<div role="status">{t('loadingWorkspace')}</div>}>
          <Dashboard title={schema.title} description={schema.description} data={data} />
        </Suspense>
      </LazyBoundary>
    );
  }
  if (component === 'board' && isOrderBoardData(data)) {
    return (
      <LazyBoundary>
        <Suspense fallback={<div role="status">{t('loadingWorkspace')}</div>}>
          <OrderBoard title={schema.title} description={schema.description} data={data} />
        </Suspense>
      </LazyBoundary>
    );
  }
  return <div role="alert">{t('invalidPage')}</div>;
}
