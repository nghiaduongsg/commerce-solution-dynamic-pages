import { useEffect } from 'react';
import isEmpty from 'lodash/isEmpty';
import { AnyType } from '@pkg-common/types';
import { useValidationsContext } from '@pkg-form/validations/ValidationsContext';

type Arguments = {
  required: boolean;
  value: AnyType;
  id: string;
  serverErrors: string[];
  fileRejections: AnyType;
};

const REQUIRED_FILE_ERROR = 'Please add a file.';

const useValidation = ({ required, value, id, serverErrors, fileRejections }: Arguments) => {
  const { getFieldErrors, setFieldErrors } = useValidationsContext();
  const errors = getFieldErrors(id);

  // Use effect bellow handles error related to required
  useEffect(() => {
    if (required) {
      // Add required error
      if (
        !errors.includes(REQUIRED_FILE_ERROR) &&
        !value['attachmentId'] &&
        !value['fileName'] &&
        !value['sizeInBytes']
      ) {
        setFieldErrors(id, [...errors, REQUIRED_FILE_ERROR]);
      } else if (!isEmpty(value) && errors.includes(REQUIRED_FILE_ERROR)) {
        setFieldErrors(
          id,
          errors.filter((item) => item !== REQUIRED_FILE_ERROR),
        );
      }
    }
  }, [value]);

  useEffect(() => {
    // Add any file rejection errors occurred
    if (fileRejections.length > 0) {
      const rejectionErrors: string[] = [];

      fileRejections.forEach((item) => {
        item.errors.forEach((error) => {
          rejectionErrors.push(`${item.file.path}: ${error.message}`);
        });
      });

      if (errors.includes(REQUIRED_FILE_ERROR)) {
        rejectionErrors.push(REQUIRED_FILE_ERROR);
      }

      setFieldErrors(id, rejectionErrors);
    } else {
      const rejectionErrors = errors.includes(REQUIRED_FILE_ERROR) ? [REQUIRED_FILE_ERROR] : [];
      setFieldErrors(id, rejectionErrors);
    }
  }, [fileRejections]);

  useEffect(() => {
    return () => {
      setFieldErrors(id, []);
    };
  }, []);

  const hasErrors = errors.length > 0 || serverErrors.length > 0 || fileRejections.length > 0;
  return { clientErrors: errors, hasErrors };
};

export default useValidation;
