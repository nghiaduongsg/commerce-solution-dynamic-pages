import apiDataReducer, { slice as ApiData } from './apiData/redux/reducers';
import codelistReducer, { slice as CodeList } from './codeList/redux/reducers';

export default {
  [ApiData]: apiDataReducer,
  [CodeList]: codelistReducer,
};
