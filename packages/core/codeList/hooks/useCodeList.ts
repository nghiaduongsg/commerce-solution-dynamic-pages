import { useSelector } from 'react-redux';
import { selectList, selectLoading } from '../redux/selectors';
import { equalityCheck } from '@pkg-common/utils/utils';

const useCodeList = (code: string) => {
  return {
    loading: useSelector(selectLoading),
    list: useSelector(selectList(code), equalityCheck),
  };
};

export default useCodeList;
