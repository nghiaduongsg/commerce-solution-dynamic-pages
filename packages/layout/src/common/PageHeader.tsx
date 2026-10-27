import React, { useMemo, useState } from 'react';

import useSystem from '@pkg-setup/src/system/useSystem';
import { useTheme } from '@mui/material/styles';
import { Box, Collapse } from '@mui/material';
import { PageHighlightData, PageTitle } from '@pkg-layout/index';
import SidePanelInfo from '@pkg-form/groups/InfoPanel/SidePanelInfo';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import usePage from '@pkg-layout/src/common/hooks/usePage';
import { SxProps } from '@mui/system';
import PageCategory from '@pkg-layout/src/common/PageCategory';

const getStyles = (theme, heroImage) => {
  return {
    container: {
      position: 'absolute',
      top: {
        xs: '115px',
        sm: '63px',
      },
      borderTop: '1px  solid gray',
      left: 0,
      width: '100%',
      boxShadow: '0 4px 2px -2px rgba(0, 0, 0, 0.16)',
      zIndex: 1100,
      backgroundColor: 'white',
      backgroundImage: `url(${heroImage})`,
    },
    innerContainer: {
      padding: `${theme.spacing(2)} ${theme.spacing(4)}`,
      borderTop: '1px solid lightgrey',
      alignItems: 'center',
      justifyContent: 'space-between',
      display: 'flex',
      width: '100%',
    },
  };
};

const PageHeader = ({
  heroImage,
  overrides,
}: {
  heroImage: string;
  overrides?: {
    includeGlobalSearch: boolean;
    textSx?: SxProps;
    backButtonSx?: SxProps;
  };
}) => {
  const { textSx = {}, includeGlobalSearch = true, backButtonSx = {} } = overrides ?? {};
  const theme = useTheme();
  const styles = getStyles(theme, heroImage);
  const uiSchema = usePage();
  const { selectedLanguage } = useSystem();

  const buttons = uiSchema?.sidePanelInfo;

  const hasHighlightedData = useMemo(() => {
    if (uiSchema) {
      return (uiSchema['ui:cards'] || [])?.cards?.length > 0;
    }
    return false;
  }, [uiSchema]);

  const [collapse, setCollapse] = useState(false);
  const { t: translate } = useTranslation([ACCESSIBILITY, COMMON]);

  return (
    <Box sx={{ ...styles.container }} id={'dynamic-page-header'}>
      <Box sx={styles.innerContainer} id={'dynamic-page-top-header'}>
        <PageCategory backButtonSx={backButtonSx} />
        <PageTitle sx={textSx} includeGlobalSearch={includeGlobalSearch} />

        <Box sx={{ display: 'flex', alignItems: 'center' }} id={'dynamic-page-expandable-header'}>
          {hasHighlightedData && (
            <GenericIconButton
              id="expand-button"
              testId="expand-button"
              onClick={() => setCollapse(!collapse)}
              ariaHasPopup="grid"
              ariaLabel={translate(collapse ? 'expand' : 'collapse', {
                ns: 'ACCESSIBILITY',
                lng: selectedLanguage,
              })}
              icon={collapse ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            />
          )}
        </Box>
      </Box>
      <Box sx={{ borderTop: `1px solid ${theme.palette.divider}` }}>
        {buttons && buttons?.length > 0 && (
          <SidePanelInfo drawerId="info-panel" sidePanelInfo={buttons} />
        )}
      </Box>
      <Box>
        {hasHighlightedData && (
          <Collapse in={collapse}>
            <PageHighlightData />
          </Collapse>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;
