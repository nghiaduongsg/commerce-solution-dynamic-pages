export const prepareCorrectionsObject = (tempFormData, parentId, formData, itemData) => {
  const path = parentId.split('_');
  const currentPath = `$.${path[1]}${path[2] ? `.${path[2]}` : ''}`;
  const formCorrectionsObj = formData?.formCorrections || {};

  if (!formCorrectionsObj[currentPath]) {
    formCorrectionsObj[currentPath] = [];
  }
  const formCorrection = {
    active: true,
    formCorrectionReasonCL: tempFormData?.reason,
    description: tempFormData?.description,
    explanation: tempFormData?.explanation,
    listActionCL: 'DELETED',
    correctedValue: JSON.stringify([itemData]),
  };
  formCorrectionsObj[currentPath].push(formCorrection);
  return formCorrectionsObj;
};
