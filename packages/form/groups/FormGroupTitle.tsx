import React, { ReactElement, useState } from 'react';
import { Grid } from '@mui/material';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import SimpleDialog from '@pkg-common/components/SimpleDialog/SimpleDialog';
import HistoryList from '@pkg-form/components/HistoryList/HistoryList';
import { DynamicFormGroup } from '@pkg-form/types';
import { AnyType } from '@pkg-common/types';
import { GenericIconButton } from '../../common/components';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';

const getStyles = () => {
  return {
    tableContainer: {
      padding: 0,
      margin: 0,
      marginBottom: 0,
      width: '100%',
    },
    container: {
      margin: 0,
      width: '100%',
      display: 'flex',
      alignItems: 'flex-start',
      flexDirection: 'row-reverse',
    },
    title: {
      textTransform: 'uppercase',
      margin: 0,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
    },
    simpleText: {
      textTransform: 'uppercase',
      paddingLeft: 4,
      fontSize: 12,
      position: 'relative',
      color: '#757575',
    },
    icon: {
      marginLeft: '5px',
    },
  };
};

const FormGroupTitle = ({
  id,
  title,
  isTable,
  elements,
  showHistoryDetails,
}: {
  id: string;
  title: string | ReactElement;
  group?: DynamicFormGroup;
  elements?: Array<AnyType>;
  level?: number;
  showHistoryDetails?: boolean;
  isTable?: boolean;
}) => {
  const styles = getStyles();
  const { selectedLanguage } = useSystem();

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const { t: translate } = useTranslation([ACCESSIBILITY, COMMON]);

  return (
    <>
      <Grid
        key={`${id}-group-title`}
        size={{ xs: 12 }}
        sx={isTable ? styles.tableContainer : styles.container}
      >
        {title}
        {showHistoryDetails && (
          <GenericIconButton
            id={`${id}_visibility-btn`}
            testId={`${id}_visibilityIcon`}
            ariaLabel={translate('view', { ns: COMMON, lng: selectedLanguage })}
            onClick={() => setShowDialog(true)}
            icon={<AssetByType input="icons" name="Visibility" />}
          />
        )}
      </Grid>
      <SimpleDialog open={showDialog} onClose={() => setShowDialog(false)} title={title as string} size="xl">
        <HistoryList id={id} elements={elements} />
      </SimpleDialog>
    </>
  );
};

export default FormGroupTitle;
