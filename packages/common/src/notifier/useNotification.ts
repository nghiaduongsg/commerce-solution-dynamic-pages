import { useSelector } from 'react-redux';

import { selectNotification } from './selectors';

const useNotification = (key) => {
  return useSelector(selectNotification(key));
};

export default useNotification;
