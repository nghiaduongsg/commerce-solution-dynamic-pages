import React from 'react';
import { useTranslation } from 'react-i18next';

class Boundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function LazyBoundary({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('workspace');
  return (
    <Boundary
      fallback={
        <div role="alert" className="inbox-load-state">
          {t('pageLoadFailed')}{' '}
          <button onClick={() => window.location.reload()}>{t('reloadPage')}</button>
        </div>
      }
    >
      {children}
    </Boundary>
  );
}
