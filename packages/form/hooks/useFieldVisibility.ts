import useFieldApplicability from '@pkg-form/hooks/useFieldApplicability';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { AnyType } from '@pkg-common/types';
import { useCallback, useEffect, useMemo } from 'react';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';
import useFieldReady from '@pkg-form/hooks/useFieldReady';
import { hasValue } from '@pkg-common/utils';

const useFieldVisibility = (id: string, readonly: boolean, disabled: boolean, options: AnyType) => {
  const {
    visibleInCard = true,
    visible = true,
    visibilityFrom,
    groupVisibilityFrom,
    filterFrom,
    preventRender = false,
    validations,
  } = options || {};
  const { check: isVisible } = useCheckFrom(id, visibilityFrom, true);
  const { check: isGroupVisible } = useCheckFrom(id, groupVisibilityFrom, true);
  const { applicable } = useFieldApplicability(id, filterFrom);
  const { setFieldVisibility, isFieldVisible } = useFormManagerContext();
  const alreadyVisible = isFieldVisible(id);
  const ready = useFieldReady(id);

  const visibility = useMemo(() => {
    return readonly && disabled ? visibleInCard : visible;
  }, [readonly, disabled, visibleInCard, visible]);

  const hasValidations = useMemo(() => {
    return hasValue(validations);
  }, [validations]);

  const finalVisibility = useMemo(() => {
    return !(!visibility || !isGroupVisible || !isVisible || !applicable);
  }, [applicable, isGroupVisible, isVisible, visibility]);

  const setupVisibility = useCallback(
    (visible: boolean) => {
      setFieldVisibility(id, visible);
    },
    [id],
  );

  useEffect(() => {
    if (!finalVisibility && ready && hasValidations && alreadyVisible) {
      setupVisibility(false);
    } else if (finalVisibility && ready && hasValidations && !alreadyVisible) {
      setupVisibility(true);
    }
  }, [setupVisibility, finalVisibility, id, ready, hasValidations, alreadyVisible]);

  return useMemo(() => {
    if (!finalVisibility) {
      return { visible: false, preventRender };
    }
    return { visible: true, preventRender: false };
  }, [preventRender, finalVisibility]);
};
export default useFieldVisibility;
