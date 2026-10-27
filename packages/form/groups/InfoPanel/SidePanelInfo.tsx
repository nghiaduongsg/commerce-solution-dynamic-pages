import SidePanelInfoInstance from './SidePanelInfoInstance';
import React, { useCallback } from 'react';
import { useDraggableDrawer } from '@pkg-common/drawer/useDrawer';
import { SidePanelInfoSchema } from '@pkg-common/types.d';
import { disableSidePanelMainButton } from '@pkg-common/utils';
import { UPDATE_ACTION_ID, USER_ACCESS_PERMISSIONS_RESOURCE_ID } from '@pkg-constants/formCommon';
import { useApiDataState } from '@pkg-core/apiData';
import { isActionAllowed } from '@pkg-common/utils/utils';
import useSystem from '@pkg-setup/src/system/useSystem';

const SidePanelInfo = ({
  drawerId,
  sidePanelInfo,
}: {
  drawerId: string;
  sidePanelInfo: Array<SidePanelInfoSchema>;
  draggable?: boolean;
}) => {
  const { setItem: setDraggableItem } = useDraggableDrawer();
  const { data: allowedOperations } = useApiDataState(USER_ACCESS_PERMISSIONS_RESOURCE_ID);
  const { allSymbol } = useSystem();
  const isUpdateAllowed = isActionAllowed(UPDATE_ACTION_ID, allowedOperations, allSymbol);

  const onOpen = useCallback((item) => {
    if (!item) return;

    const { enabled } = item.uiSchema?.['ui:mainButton'] || {};

    const updatedItem =
      enabled === undefined
        ? {
            ...item,
            uiSchema: disableSidePanelMainButton(item.uiSchema),
          }
        : item;

    setDraggableItem({ item: updatedItem, id: updatedItem.key });
  }, []);

  return (
    <>
      {sidePanelInfo?.map((item) => {
        if (item.key === 'History' && !isUpdateAllowed) return null;
        return (
          <SidePanelInfoInstance key={item.key} drawerId={drawerId} onOpen={onOpen} item={item} />
        );
      })}
    </>
  );
};
export default SidePanelInfo;
