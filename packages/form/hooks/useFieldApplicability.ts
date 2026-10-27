import useFormData from '@pkg-common/dataResolver/useFormData';
import { FilterFromSchema } from '@pkg-form/types';

const useFieldApplicability = (id: string, filterFrom: FilterFromSchema | null | undefined) => {
  // @ts-ignore
  const { value } = useFormData(id, filterFrom?.source);
  // @ts-ignore
  const applicable = !!(value === 0 || (value && value.toString().length > 0));

  return { applicable: !filterFrom || !filterFrom.source ? true : applicable };
};

export default useFieldApplicability;
