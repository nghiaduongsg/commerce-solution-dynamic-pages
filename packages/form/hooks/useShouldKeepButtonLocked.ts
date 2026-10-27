import { useMemo } from 'react';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';

const IGNORED_IDS = [
  'EntitySchema',
  'TranslationsManagement',
  'IssPageSchema',
  'CodelistItem',
  'Codelist',
  'IssCodelistItem',
  'IssCodelist',
  'SecurableObject',
];

export default function useShouldKeepButtonLocked({
  id,
  disabled,
  uiSchema,
  data,
}: {
  id: string;
  disabled: boolean;
  uiSchema: Record<string, unknown>;
  data: Record<string, unknown>;
}) {
  const uiDisabled = uiSchema?.['ui:disabled'];
  const disabledFrom = uiSchema?.disabledFrom;

  const { check: disabledFromCondition } = useCheckFrom(id, disabledFrom);

  const disabledFromOwner = useMemo(() => {
    if (id?.includes('filters')) {
      return false;
    }
    if (data?.ownerCL === 'BASE') {
      return true;
    }
    return false;
  }, [data, id]);

  const disabledFromBaseOwner = useMemo(() => {
    return disabledFromOwner && !uiSchema?.['ui:ignoreOwnerCL'] && !IGNORED_IDS.includes(id);
  }, [uiSchema, disabledFromOwner, id]);

  return useMemo(() => {
    return disabled || uiDisabled || disabledFromCondition || disabledFromBaseOwner;
  }, [disabled, uiDisabled, disabledFromCondition, disabledFromBaseOwner]);
}
