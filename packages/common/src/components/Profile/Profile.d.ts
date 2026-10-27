import { AnyType } from '@pkg-common/types';
import { ReactElement } from 'react';

interface ProfileProps {
  userAccountUrl?: string;
  customActions?: Array<{
    id: string;
    icon: ReactElement;
    label: string | ReactElement;
    onClick: () => void | Promise<AnyType>;
  }>;
}
