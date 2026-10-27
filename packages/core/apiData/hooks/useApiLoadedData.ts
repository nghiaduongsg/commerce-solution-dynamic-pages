import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { equalityCheck } from '@pkg-common/utils/utils';
import { selectApiData } from '@pkg-core/apiData/redux/selectors';

const useApiLoadedData = (id: string) => {
  const data = useSelector(selectApiData(id), equalityCheck);

  return useMemo(() => {
    return data;
  }, [data]);
};

export default useApiLoadedData;
