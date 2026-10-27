import React, { useCallback, useMemo, useState } from 'react';
import ChangesConfirmation from '@pkg-common/components/ChangesConfirmation/ChangesConfirmation';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { AnyType } from '@pkg-common/types';

type UseChangesConfirmationOptions = {
  pageId: string;
  enabled?: boolean;
  onConfirm: (options?: AnyType) => void;
  title?: string;
};

const useChangesConfirmation = ({
  pageId,
  enabled = false,
  onConfirm,
  title,
}: UseChangesConfirmationOptions) => {
  const { hasChanges } = useEntityFormData(pageId);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState<AnyType | undefined>();

  const handleButtonClick = useCallback(
    (options?: AnyType) => {
      if (enabled && hasChanges) {
        setConfirmOptions(options);
        setShowConfirm(true);
        return;
      }
      onConfirm(options);
    },
    [enabled, hasChanges, onConfirm],
  );

  const confirmDialog = useMemo(() => {
    if (!enabled) {
      return null;
    }
    return (
      <ChangesConfirmation
        pageId={pageId}
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          setShowConfirm(false);
          onConfirm(confirmOptions);
        }}
        title={title}
      />
    );
  }, [enabled, pageId, showConfirm, onConfirm, confirmOptions, title]);

  return {
    showConfirm,
    handleButtonClick,
    confirmDialog,
  };
};

export default useChangesConfirmation;
