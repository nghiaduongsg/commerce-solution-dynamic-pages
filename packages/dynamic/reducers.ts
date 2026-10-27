import tablesReducer from '../list/src/reducers';
import entitiesReducer from '../entity/redux/reducers';
import validationsReducer, { slice as FormValidations } from '../form/validations/redux/reducers';

export default {
  Tables: tablesReducer,
  Entities: entitiesReducer,
  [FormValidations]: validationsReducer,
};
