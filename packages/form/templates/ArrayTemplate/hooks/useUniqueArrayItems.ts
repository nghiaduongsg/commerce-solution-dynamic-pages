import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { SetFormServerErrors } from '@pkg-form/validations/redux/reducers';

import { getArrayItemData, getArrayItemSchema } from '@pkg-form/validations/utils/formUtils';
import { VALIDATIONS } from '@pkg-constants/translationNamespaces';
import { isEqual } from 'lodash';
import { keepSchemaProps } from '@pkg-form/validations/utils/schemaUtils';
import { AnyType } from '@pkg-common/types';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useValidationsContext } from '@pkg-form/validations/ValidationsContext';

const useUniqueArrayItems = (fieldId: string, items: Array<AnyType> = [], unique = false) => {
  const dispatch = useDispatch();
  const { addFieldErrors, removeFieldErrors } = useValidationsContext();
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([VALIDATIONS]);

  useEffect(() => {
    if (items.length > 1 && unique) {
      const lastItemData = getArrayItemData(items[items.length - 1]);

      const combinationExists = !!items.find(
        (item, index) =>
          index < items.length - 1 &&
          isEqual(lastItemData, keepSchemaProps(getArrayItemSchema(item), getArrayItemData(item))),
      );
      const field = `${fieldId}_${items.length - 1}`;
      const errors = [translate('combinationExists', { ns: VALIDATIONS, lng: selectedLanguage })];
      if (combinationExists) {
        addFieldErrors(field, errors);
        dispatch(
          SetFormServerErrors({
            errors: {
              [field]: errors,
            },
            errorTypes: {},
          }),
        );
      } else {
        removeFieldErrors(field, errors);
        dispatch(
          SetFormServerErrors({
            errors: {
              [field]: [],
            },
            errorTypes: {},
          }),
        );
      }
    }
  }, [items, selectedLanguage]);
};

export default useUniqueArrayItems;
