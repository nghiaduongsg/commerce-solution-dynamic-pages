import React from 'react';
import CollapseContent from '@pkg-common/atomics/CollapseContent/CollapseContent';
import FormGroupContentContainer from '@pkg-form/groups/FormGroupContentContainer';
import { AnyType, InfoSchema } from '@pkg-common/types';
import { AppActionButtons } from '@pkg-common/button/types';

export type AccordionFieldTemplateProps = {
  id: string;
  title: AnyType;
  children: AnyType;
  error: boolean;
  info: boolean;
  collapseStatus?: boolean;
  buttons?: AppActionButtons;
  information?: Array<InfoSchema>;
};
const AccordionFieldTemplate = ({
  id,
  title,
  children,
  collapseStatus,
  buttons,
  information,
}: AccordionFieldTemplateProps) => {
  return (
    <div style={{ marginBottom: 16 }}>
      <CollapseContent
        title={title}
        id={`${id}-accordion`}
        collapseStatus={collapseStatus || false}
        buttons={buttons}
        information={information}
      >
        <FormGroupContentContainer>{children}</FormGroupContentContainer>
      </CollapseContent>
    </div>
  );
};

export default AccordionFieldTemplate;
