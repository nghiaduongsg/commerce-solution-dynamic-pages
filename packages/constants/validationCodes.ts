//Pattern
//https://confluence.intrasoft-intl.com/display/IC/UI+Validation+Error+Codes

export const validationCodes = {
  arrayRequired: `ST-UI-V0001`,
  arrayMinLength: `ST-UI-V0002`,
  arrayMaxLength: `ST-UI-V0003`,
  invalidDate: `ST-UI-V0004`,
  dateMinValue: `ST-UI-V0005`,
  dateMaxValue: `ST-UI-V0006`,
  dateMinValueExcludeLimit: `ST-UI-V0007`,
  dateMaxValueExcludeLimit: `ST-UI-V0008`,
  required: `ST-UI-V0009`,
  minValue: `ST-UI-V0010`,
  maxValue: `ST-UI-V0011`,
  minValueExcludeLimit: `STE-UI-V0012`,
  maxValueExcludeLimit: `ST-UI-V0013`,
  minLength: `ST-UI-V0014`,
  maxLength: `ST-UI-V0015`,
  invalidFormat: `ST-UI-V0016`,
  combinationExists: `ST-UI-V0017`,
  allNamesRequired: `ST-UI-V0018`,
  descriptionsMaxLength: `ST-UI-V0019`,
  bicRegex: `ST-UI-V0020`,
  invalidYesNoValue: `ST-UI-V0021`,
};

export const commonCodes = {
  formErrorMessage: `ST-UI-C0001`,
  imageOverload: 'ST-UI-C0002',
  clientValidationErrors: 'ST-UI-C0003',
  userHasNoAccessToPage: 'ST-UI-C0004',
  imageNotFound: 'ST-UI-C0005',
};
