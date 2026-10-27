import React, { ReactElement, useState } from 'react';
import { Box, ButtonBase, Collapse } from '@mui/material';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import HeaderTitle from '@pkg-form/templates/FieldTitle/HeaderTitle';
import { AnyType, InfoSchema } from '@pkg-common/types';
import useExpandAll from '@pkg-common/hooks/useExpandAll';

export interface CollapseContentProps {
  title?: string | ReactElement;
  children?: ReactElement;
  id: string;
  errorMessage?: string;
  unmountOnExit?: boolean;
  collapseStatus?: boolean;
  buttons?: AnyType;
  information?: Array<InfoSchema>;
  onToggle?: (nextExpanded: boolean) => void | Promise<void>;
}

const CollapseContent: React.FC<CollapseContentProps> = ({
  id,
  title = null,
  children,
  errorMessage,
  unmountOnExit,
  collapseStatus = false,
  buttons,
  information,
  onToggle,
}) => {
  const [expanded, setExpanded] = useState(!collapseStatus);
  useExpandAll(setExpanded);

  const handleClick = async () => {
    const nextExpanded = !expanded;

    if (onToggle) {
      await onToggle(nextExpanded);
    }

    setExpanded(nextExpanded);
  };

  return (
    <>
      <ButtonBase
        className={expanded ? 'MuiAccordion--expanded' : 'MuiAccordion'} //do not change this, it's used in theme
        onClick={handleClick}
        id={`collapse-content-${id}`}
        aria-expanded={expanded}
        aria-errormessage={errorMessage}
        aria-controls={`collapse-details-${id}`}
        aria-labelledby={id}
      >
        <HeaderTitle
          id={id}
          title={title || id}
          testId={`collapse-content-${id}-title`}
          buttons={buttons}
          errorMessage={errorMessage}
          information={information}
        />

        <Box>
          <AssetByType input="icons" name={expanded ? 'KeyboardArrowUp' : 'KeyboardArrowDown'} />
        </Box>
      </ButtonBase>
      <Collapse
        in={expanded}
        unmountOnExit={unmountOnExit}
        id={`collapse-details-${id}`}
        aria-hidden={!expanded}
        className={'MuiAccordion--expanded'}
      >
        {children}
      </Collapse>
    </>
  );
};

export default CollapseContent;
