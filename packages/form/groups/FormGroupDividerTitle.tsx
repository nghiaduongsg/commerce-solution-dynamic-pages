import React, { ReactElement } from 'react';
import { Grid, Divider } from '@mui/material';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import useDrawer from '@pkg-common/drawer/useDrawer';
import { SUMMARY_PANEL } from '@pkg-constants/formIds';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { CheckFromSchema, InfoSchema } from '@pkg-common/types';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import HeaderTitle from '@pkg-form/templates/FieldTitle/HeaderTitle';
import { AppActionButtons } from '@pkg-common/components/AppActions/types';

const useStyles = () => {
  return {
    container: {
      paddingTop: '12px',
      margin: 0,
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    divider: {
      width: '100%',
    },
  };
};

const FormGroupDividerTitle = ({
  id,
  title,
  drawerActivityFrom,
  children,
  badge,
  buttons,
  information,
}: {
  id: string;
  title: string | ReactElement;
  drawerActivityFrom?: CheckFromSchema;
  children?: ReactElement | Array<ReactElement | null> | null;
  badge?: number;
  buttons?: AppActionButtons;
  information?: Array<InfoSchema>;
}) => {
  const styles = useStyles();

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);
  const { openDrawer } = useDrawer(SUMMARY_PANEL);
  const { check: showDrawerActivity } = useCheckFrom(id, drawerActivityFrom, false);

  return (
    <>
      <Grid key={`${id}-group-title`} size={{ xs: 12 }} sx={styles.container}>
        <HeaderTitle
          id={id}
          testId={`divider-title-${id}`}
          title={title}
          badge={badge}
          buttons={buttons}
          information={information}
        />
        {children}
        {showDrawerActivity && (
          <GenericIconButton
            id={`${id}-summary-btn`}
            testId="summary-btn"
            label={translate('summary', { ns: COMMON, lng: selectedLanguage })}
            ariaLabel={translate('summary', { ns: COMMON, lng: selectedLanguage })}
            ariaDescription={translate('genericSummaryButtonAriaDescription', {
              ns: ACCESSIBILITY,
              id,
              lng: selectedLanguage,
            })}
            ariaHasPopup={true}
            onClick={openDrawer}
            icon={<AssetByType input="icons" name="More" />}
          />
        )}
      </Grid>
      <Divider sx={styles.divider} />
    </>
  );
};

export default FormGroupDividerTitle;
