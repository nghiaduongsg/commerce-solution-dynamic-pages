import React, { useState } from 'react';

import AppDrawer from '@pkg-common/drawer/AppDrawer';
import { SUMMARY_PANEL } from '@pkg-constants/formIds';
import { COMMON } from '@pkg-constants/translationNamespaces';
import CaseScopeSummaryPerType from './CaseScopeSummaryPerType';
import { Tab, Tabs } from '@mui/material';
import TabPanel from '@pkg-form/groups/Tabbar/TabPanel';
import { CaseScopeSummaryType } from './CaseScopeSummary.d';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';

const CaseScopeSummary = ({
  widgetId,
  selections,
  savedScope,
  currentScope,
  namespace,
}: {
  widgetId: string;
  namespace: string;
  selections: CaseScopeSummaryType;
  savedScope: CaseScopeSummaryType;
  currentScope: CaseScopeSummaryType;
}) => {
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([namespace, COMMON]);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <AppDrawer
      drawerId={SUMMARY_PANEL}
      closeButtonId={`${widgetId}-summary-close-btn`}
      title={translate('summary', { ns: COMMON, lng: selectedLanguage })}
    >
      <>
        <Tabs
          id="case-scope-tabs"
          data-testid="case-scope-tabs"
          value={selectedTabIndex || 0}
          onChange={(_, tabIndex) => setSelectedTabIndex(tabIndex)}
          scrollButtons="on"
          variant="scrollable"
          textColor="primary"
          indicatorColor="secondary"
        >
          <Tab
            label={translate('liabilityScope', { ns: namespace, lng: selectedLanguage })}
            id="liability-scope"
            data-testid="liability-scope"
          />
          <Tab
            label={translate('caseScope', { ns: namespace, lng: selectedLanguage })}
            id="saved-scope"
            data-testid="case-scope"
          />
          <Tab
            label={translate('currentScopeSelections', { ns: namespace, lng: selectedLanguage })}
            id="current-scope"
            data-testid="current-scope"
          />
        </Tabs>
        <TabPanel
          id="liability-scope-panel"
          data-testid="liability-scope-panel"
          selectedTabIndex={selectedTabIndex}
          index={0}
        >
          {Object.keys(selections)
            .filter((selection) => !!selection)
            .map((selection) => (
              <CaseScopeSummaryPerType
                key={selection}
                selection={selections[selection]}
                namespace={namespace}
              />
            ))}
        </TabPanel>
        <TabPanel
          id="saved-scope-panel"
          data-testid="saved-scope-panel"
          selectedTabIndex={selectedTabIndex}
          index={1}
        >
          {Object.keys(savedScope)
            .filter((selection) => !!selection)
            .map((selection) => (
              <CaseScopeSummaryPerType
                key={selection}
                selection={savedScope[selection]}
                namespace={namespace}
              />
            ))}
        </TabPanel>

        <TabPanel
          id="current-scope-panel"
          data-testid="current-scope-panel"
          selectedTabIndex={selectedTabIndex}
          index={2}
        >
          {Object.keys(currentScope)
            .filter((selection) => !!selection)
            .map((selection) => (
              <CaseScopeSummaryPerType
                key={selection}
                selection={currentScope[selection]}
                namespace={namespace}
              />
            ))}
        </TabPanel>
      </>
    </AppDrawer>
  );
};

export default CaseScopeSummary;
