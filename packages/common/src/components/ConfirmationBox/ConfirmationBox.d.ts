import { AnyType } from '@pkg-common/types';

export default interface ConfirmationBoxProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: any;
  testId?: string;
  choices: Array<{
    label: string;
    action?: AnyType;
    variant?: 'text' | 'outlined' | 'contained';
    testId?: string;
  }>;
}
