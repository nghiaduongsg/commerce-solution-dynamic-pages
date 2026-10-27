import React, { useMemo } from 'react';
import sortBy from 'lodash/sortBy';
import { AnyType } from '@pkg-common/types';
import useEntity from '@pkg-entity/hooks/useEntity';
import useApiDataState from '@pkg-core/apiData/hooks/useApiDataState';
import useSystem from '@pkg-setup/src/system/useSystem';
import { transformSchemas } from '@pkg-form/validations/utils/schemaUtils';
import LoadingBackdrop from '@pkg-common/components/LoadingBackdrop/LoadingBackdrop';
import GenericPage from '@pkg-form/components/GenericPage';
import { COUNTRIES } from '@pkg-constants/codeListVariables';

const ADDRESS_STANDARDS_ID = 'AddressStandard';
const ADDRESSES_ID = 'Address';

const AddressForm = ({ uiSchema, schema: jsonSchema }: { uiSchema: AnyType; schema: AnyType }) => {
  const { loading } = useEntity(ADDRESSES_ID);
  const { data: selectedAddressStandard, loading: addressStandardsLoading } =
    useApiDataState(ADDRESS_STANDARDS_ID);

  const { selectedLanguage } = useSystem();

  const { schema: finalSchema, uiSchema: finalUiSchema } = useMemo(() => {
    if (!jsonSchema || !uiSchema) {
      return { schema: jsonSchema, uiSchema };
    }
    if (selectedAddressStandard?.elements?.length > 0) {
      const elements = sortBy(selectedAddressStandard.elements, ['orderNumber']);

      const currentSchema = { ...jsonSchema };
      const currentUIJsonSchema = { ...uiSchema };
      const overrideOptions = uiSchema['overrideOptions'] || {};
      // Removing any previously defined address1, address2, ...
      for (let index = 1; index <= 10; index++) {
        if (currentSchema.properties[`address${index}`]) {
          delete currentSchema.properties[`address${index}`];
        }

        if (currentUIJsonSchema[`address${index}`]) {
          delete currentUIJsonSchema[`address${index}`];
        }
      }

      elements.push({
        addressElementCL: 'COUNTRY',
        addressElementCLModelName: 'countryCL',
        omit: true,
        codelistCode: COUNTRIES,
      });

      return transformSchemas(
        elements,
        currentSchema,
        currentUIJsonSchema,
        selectedLanguage,
        'addressElementCL',
        overrideOptions,
      );
    }
    return { schema: jsonSchema, uiSchema };
  }, [selectedAddressStandard, jsonSchema, uiSchema]);

  const shouldDisplayBackdrop = loading || addressStandardsLoading;

  return (
    <>
      {shouldDisplayBackdrop && <LoadingBackdrop open />}
      <GenericPage schema={finalSchema} uiSchema={finalUiSchema} />
    </>
  );
};

export default AddressForm;
