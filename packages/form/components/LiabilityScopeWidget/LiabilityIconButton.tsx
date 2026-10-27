import React, { useMemo, useState } from 'react';

import { alpha, ListItemText, Menu, MenuItem, TableCell, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AnyType } from '@pkg-common/types';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import useCodeLists from '@pkg-core/codeList/hooks/useCodeLists';
import useCodeList from '@pkg-core/codeList/hooks/useCodeList';
import { selectTableSelectedRows } from '@pkg-list/src/selectors';
import { useSelector } from 'react-redux';
import { FeedbackOutlined } from '@mui/icons-material';
import useSystem from '@pkg-setup/src/system/useSystem';

const getStyles = (theme) => ({
  menu: {
    '& .MuiList-padding': {
      paddingBottom: '0px',
      paddingTop: '0px',
    },
    '& .MuiListItem-button': {
      '& .MuiListItemIcon-root': {
        color: theme.palette?.common.black,
      },
    },
  },
  viewTitle: {
    cursor: 'auto',
    fontWeight: 'bold',
    backgroundColor: '#eaeaea',
    '&:hover': {
      backgroundColor: '#eaeaea',
    },
  },
  viewChildBillSegments: {
    cursor: 'auto',
    fontWeight: 'bold',
    backgroundColor: 'white',
    '&:hover': {
      backgroundColor: 'white',
    },
  },
  noChildBillSegments: {
    cursor: 'auto',
    fontSize: '13px',
    backgroundColor: 'white',
    '&:hover': {
      backgroundColor: 'white',
    },
  },
});

const DROPDOWN_API = 'taxpayer-accounting/bill-segment-types/child-bill-segment-types/dropdown';
const CODELIST = 'Child_Bill_Segment';
const INCLUDED_BILL_SEGMENT_COLUMN_LIABILITY = 5;
const INCLUDED_BILL_SEGMENT_COLUMN_CASE_SCOPE = 8;
const BillSegment = 'billSegment';

const LiabilityIconButton = ({
  rowId,
  type,
  namespaces = [COMMON, ACCESSIBILITY],
  visible,
  isCell = true,
  tableId,
}: {
  rowId?: string;
  type?: string;
  namespaces: Array<string>;
  visible?: boolean;
  isCell?: boolean;
  tableId?: string;
}) => {
  const styles = getStyles(useTheme());

  const { loadCodeList } = useCodeLists();

  const [anchorEl, setAnchorEl] = useState(null);
  const { list, loading } = useCodeList(rowId ? `${CODELIST}_${rowId}` : `${CODELIST}_${type}`);

  const selectedRows = useSelector(
    selectTableSelectedRows(
      tableId,
      tableId === BillSegment
        ? INCLUDED_BILL_SEGMENT_COLUMN_CASE_SCOPE
        : INCLUDED_BILL_SEGMENT_COLUMN_LIABILITY,
    ),
  );

  const isSelected = useMemo(() => {
    if (rowId) return !!selectedRows[rowId];
    return true;
  }, [selectedRows, rowId]);

  const [open, setOpen] = useState(false);
  const onClose = () => {
    setOpen(false);
    setAnchorEl(null);
  };
  const onOpen = (e) => {
    setAnchorEl(e.currentTarget);
    loadCodeList(
      DROPDOWN_API,
      rowId ? `${CODELIST}_${rowId}` : `${CODELIST}_${type}`,
      undefined,
      type ? { parentBillSegmentTypeCodes: [type] } : { parentBillSegmentIds: [`${rowId}`] },
    );
    setOpen(true);
  };

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation(namespaces);

  return (
    <TableCell
      style={isCell ? {} : { borderBottom: 'none' }}
      tabIndex={0}
      width={50}
      role="cell"
      // aria-label={translate('tableCellAriaLabel', { ns: ACCESSIBILITY, lng: selectedLanguage })}
      // aria-description={translate('tableCellAriaDescription', {
      //   ns: ACCESSIBILITY,
      //   lng: selectedLanguage,
      // })}
    >
      {visible && isSelected && (
        <GenericIconButton
          id={`${rowId}_child_bill_segment`}
          testId="user-notifications-btn"
          ariaLabel={translate('viewChildBillSegments', { lng: selectedLanguage })}
          onClick={onOpen}
          size="medium"
          icon={<FeedbackOutlined />}
        />
      )}
      <Menu
        style={{ padding: '0' }}
        anchorEl={anchorEl}
        elevation={0}
        sx={styles.menu}
        keepMounted
        open={open}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        getContentAnchorEl={null}
        slotProps={{
          paper: {
            style: {
              borderRadius: '8px',
              boxShadow: `0 0 8px ${alpha(useTheme().palette?.common.black, 0.16)}`,
            },
          },
        }}
        tabIndex={0}
        aria-label={translate('viewChildBillSegments', { lng: selectedLanguage })}
      >
        <MenuItem sx={styles.viewTitle}>
          {translate('viewChildBillSegments', { lng: selectedLanguage })}
        </MenuItem>
        {(list || []).map((listItem: AnyType) => (
          <MenuItem
            sx={styles.viewChildBillSegments}
            style={{ cursor: 'auto' }}
            id={`listItem-${listItem.code}`}
            key={`${listItem.code}`}
            tabIndex={0}
            aria-label={translate('viewChildBillSegments', { lng: selectedLanguage })}
          >
            <ListItemText
              primary={<Typography>{listItem.label}</Typography>}
              tabIndex={0}
              aria-label={listItem.label}
            />
          </MenuItem>
        ))}
        {list.length === 0 && !loading && (
          <MenuItem sx={styles.noChildBillSegments}>
            {translate('noChildBillSegments', { lng: selectedLanguage })}
          </MenuItem>
        )}
      </Menu>
    </TableCell>
  );
};

export default LiabilityIconButton;
