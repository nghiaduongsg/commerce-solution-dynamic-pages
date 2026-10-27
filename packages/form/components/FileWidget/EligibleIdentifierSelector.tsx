import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import useApiData from '@pkg-core/apiData/hooks/useApiData';
import GenericAutoComplete from '@pkg-common/atomics/GenericSelect/GenericAutoComplete';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';

interface EligibleIdentifierSelectorProps {
  id: string;
  pageType: 'PartyRole' | 'Party';
  value: string | null;
  onChange: (value: string | null) => void;
  entity: string;
  namespace: string;
}

export const EligibleIdentifierSelector: React.FC<EligibleIdentifierSelectorProps> = ({
  id,
  pageType,
  value,
  onChange,
  entity,
  namespace,
}) => {
  const { t: translate } = useTranslation(namespace);
  const { selectedLanguage } = useSystem();
  const partyIdentifiers = useSelector(
    (state: any) => state.Entities?.History?.entity?.identifiers ?? [],
  );

  const partyRoleEligibleIdentifiers = useSelector(
    (state: any) => state.Entities?.History?.entity?.eligibleIdentifiers ?? [],
  );

  const historyUrl =
    pageType === 'Party' ? `registration/parties/${entity}` : `registration/party-roles/${entity}`;

  useApiData('DATA', {
    url: historyUrl,
    resourceToEntity: 'History',
    applyWhen: {
      operator: 'every',
      fields: [
        {
          key: 'HistoryPartyIdentifiers',
          operator: 'isUndefined',
          source: {
            type: 'STORE',
            code: 'Entities',
            jsonPath: ['History', 'entity', 'identifiers'],
          },
        },
        {
          key: 'HistoryPartyRoleEligibleIdentifiers',
          operator: 'isUndefined',
          source: {
            type: 'STORE',
            code: 'Entities',
            jsonPath: ['History', 'entity', 'eligibleIdentifiers'],
          },
        },
      ],
    },
  });

  const mapIdentifierToOption = (identifier: any) => {
    if (!identifier?.id || !identifier?.identificationLabel) return null;
    return {
      code: identifier.id,
      label: identifier.identificationLabel,
    };
  };

  const options = useMemo(() => {
    if (pageType === 'Party' && Array.isArray(partyIdentifiers)) {
      return partyIdentifiers
        .map((identifier) => mapIdentifierToOption(identifier))
        .filter(Boolean) as any[];
    }

    if (pageType === 'PartyRole' && Array.isArray(partyRoleEligibleIdentifiers)) {
      return partyRoleEligibleIdentifiers
        .map((eligible) => mapIdentifierToOption(eligible?.partyIdentifier))
        .filter(Boolean) as any[];
    }

    return [];
  }, [pageType, partyIdentifiers, partyRoleEligibleIdentifiers]);

  return (
    <GenericAutoComplete
      id={id}
      label={translate(`${pageType}_eligibleIdentifierSelectorLabel`, {
        ns: namespace,
        lng: selectedLanguage,
      })}
      options={options}
      value={options.find((opt) => opt.code === value) ?? null}
      onChange={(newValue: any) => {
        onChange(newValue ? newValue.code : null);
      }}
      multiple={false}
      disabled={!options.length}
      fullWidth={true}
      valid={true}
    />
  );
};
