import { useEffect } from 'react';
import { useBlocker } from 'react-router';

interface NavigationGuardTypes {
  shouldBlock: boolean;
  leaveMsg: string;
}

export default function useNavigationGuard({ shouldBlock, leaveMsg }: NavigationGuardTypes): void {
  const blocker = useBlocker(shouldBlock);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      const confirmLeave = window?.confirm(leaveMsg);
      if (confirmLeave) blocker.proceed();
      else blocker.reset();
    }
  }, [blocker?.state]);

  useEffect(() => {
    if (!shouldBlock) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window?.addEventListener('beforeunload', handleBeforeUnload);
    return () => window?.removeEventListener('beforeunload', handleBeforeUnload);
  }, [shouldBlock, leaveMsg]);
}
