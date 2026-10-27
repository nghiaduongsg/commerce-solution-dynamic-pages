export type FormValidationsReduxState = {
  FormValidations: FormValidationsState;
};

export type FormValidationsState = {
  errors: { [key: string]: Array<string> };
  serverErrors: { [key: string]: Array<string> };
  serverErrorTypes: {
    [key: string]: Array<{ message: string; type: 'WARNING' | 'ERROR' }>;
  };
  validationStep?: string | null;
};
