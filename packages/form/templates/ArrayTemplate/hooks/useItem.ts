import useFieldServerValidations from '@pkg-form/validations/hooks/useFieldServerValidations';
import useFormValidity from '@pkg-form/validations/hooks/useFormValidity';

const useItem = (id: string, { onEdit, onDuplicate, onDelete }) => {
  const { errors: serverErrors } = useFieldServerValidations(id);
  const { isFormValidServerSide, isFormValid } = useFormValidity(id);

  const defaultActions = {
    EDIT: {
      type: 'EDIT',
      title: 'edit',
      icon: 'EDIT',
      onClick: onEdit,
      style: 'simple',
      permissionKey: 'defaultItemActions',
    },
    VIEW: {
      type: 'VIEW',
      icon: 'VIEW',
      onClick: onEdit,
      style: 'simple',
      permissionKey: 'defaultItemActions',
    },
    DUPLICATE: {
      type: 'DUPLICATE',
      title: 'duplicate',
      icon: 'DUPLICATE',
      onClick: onDuplicate,
      style: 'simple',
      permissionKey: 'defaultItemActions',
    },
    DELETE: {
      type: 'DELETE',
      title: 'delete',
      icon: 'DELETE',
      onClick: onDelete,
      style: 'simple',
      permissionKey: 'defaultItemActions',
    },
  };

  return {
    defaultActions,
    serverErrors,
    isValid: isFormValidServerSide && isFormValid,
  };
};

export default useItem;
