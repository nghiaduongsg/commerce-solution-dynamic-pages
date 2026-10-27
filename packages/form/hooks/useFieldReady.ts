import { useMemo } from 'react';
import { useParams } from 'react-router';
import useClearApiData from '@pkg-core/apiData/hooks/useClearApiData';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';

const useFieldReady = (fieldId: string) => {
  const { apisFinished } = useClearApiData();
  const { isFieldDirty } = useFormManagerContext();

  const routeParams = useParams<{ idKey?: string }>();
  const hasBeenSaved = useMemo(() => {
    return !!routeParams?.idKey;
  }, [routeParams?.idKey]);
  const dirty = isFieldDirty(fieldId);

  return useMemo(() => {
    if (!apisFinished) {
      return false;
    }
    if (hasBeenSaved && !dirty) {
      return false;
    }

    return true;
  }, [apisFinished, hasBeenSaved, dirty]);
};

export default useFieldReady;
