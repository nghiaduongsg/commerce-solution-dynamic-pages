import React from 'react';
import { AnyType } from '@pkg-common/types';
import { alpha, SvgIcon, Typography } from '@mui/material';
import * as Icons from '@mui/icons-material';
import useSystem from '@pkg-setup/src/system/useSystem';
import { isEmpty } from 'lodash';

import {
  AddPhotoAlternateOutlined,
  Build,
  ManageAccounts,
  Face3,
  PersonPinCircleOutlined,
  BookmarksSharp,
  Rule,
  Circle,
  Undo,
  ExitToApp,
  Notifications,
  Help,
  ArrowDropDown,
  KeyboardArrowDown,
  PlaylistAddCheck,
  KeyboardArrowUp,
  KeyboardArrowRight,
  KeyboardArrowLeft,
  VerticalAlignTop,
  Folder,
  DarkMode,
  Palette,
  Description,
  Link,
  Check,
  Compare,
  SearchOff,
  InfoRounded,
  Close,
  ArrowDropUp,
  ArrowBack,
  ArrowForward,
  AddCircle,
  Edit,
  EditSharp,
  Delete,
  DoneAll,
  DeleteForever,
  DeleteForeverSharp,
  Search,
  LastPage,
  DragHandle,
  FirstPage,
  Autorenew,
  ArrowRight,
  CheckBox,
  ErrorOutline,
  More,
  MoreHorizRounded,
  NavigateNext,
  Save,
  RemoveCircleOutline,
  SelectAllOutlined,
  Visibility,
  CloudDownloadSharp,
  GetAppSharp,
  List,
  OpenInNew,
  Clear,
  DescriptionSharp,
  Settings,
  Transform,
  Cancel,
  AssignmentInd,
  LabelImportant,
  FileCopy,
  CloudUpload,
  Menu,
  FavoriteBorder,
  InfoOutlined,
  MoreVert,
  ViewWeek,
  LightMode,
  Publish,
  HomeWork,
  EnhancedEncryption,
  PostAdd,
  VpnKey,
  Lock,
  ToggleOn,
  Accessibility,
  UnfoldMoreDouble,
  UnfoldLessDouble,
  Keyboard,
  Expand,
  Compress,
  Queue,
  UploadFile,
  FileDownload,
  FileUpload,
  Language,
  EditNote,
  Preview,
  East,
  PermContactCalendarOutlined,
  FilterList,
  Assignment,
  AssignmentLate,
  CalendarMonth,
  Work,
  WorkHistory,
  Payment,
  PriceCheck,
  Schedule,
} from '@mui/icons-material';

const defaultIcons = {
  Work,
  AddPhotoAlternateOutlined,
  WorkHistory,
  CalendarMonth,
  Assignment,
  AssignmentLate,
  ManageAccounts,
  Face3,
  BookmarksSharp,
  Rule,
  Circle,
  FileDownload,
  FileUpload,
  ToggleOn,
  Lock,
  VerticalAlignTop,
  InfoOutlined,
  FavoriteBorder,
  MoreVert,
  ViewWeek,
  Folder,
  Description,
  Undo,
  Link,
  Settings,
  Check,
  Compare,
  SearchOff,
  InfoRounded,
  Transform,
  Close,
  ArrowDropUp,
  AddCircle,
  Edit,
  Delete,
  Clear,
  FileCopy,
  CloudUpload,
  Menu,
  DoneAll,
  DeleteForeverSharp,
  EditSharp,
  Search,
  LastPage,
  OpenInNew,
  FirstPage,
  ArrowBack,
  ArrowForward,
  Autorenew,
  ArrowRight,
  CheckBox,
  DeleteForever,
  ErrorOutline,
  DarkMode,
  LightMode,
  Palette,
  More,
  Event,
  MoreHorizRounded,
  NavigateNext,
  Save,
  DragHandle,
  RemoveCircleOutline,
  SelectAllOutlined,
  Visibility: Visibility,
  CloudDownloadSharp,
  GetAppSharp,
  DescriptionSharp,
  List,
  Cancel,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardArrowDown,
  KeyboardArrowUp,
  ExitToApp,
  Notifications,
  Help,
  ArrowDropDown,
  AssignmentInd,
  LabelImportant,
  Publish,
  HomeWork,
  PlaylistAddCheck,
  EnhancedEncryption,
  PostAdd,
  VpnKey,
  Accessibility,
  Keyboard,
  UnfoldMoreDouble,
  UnfoldLessDouble,
  Expand,
  Compress,
  Queue,
  UploadFile,
  Language,
  EditNote,
  Preview,
  East,
  PermContactCalendarOutlined,
  FilterList,
  PersonPinCircleOutlined,
  Build,
  Payment,
  PriceCheck,
  Schedule,
};

const retrieveIconFromMaterialObjects = (name: string) => {
  if (!Icons[name]) {
    return defaultIcons[name] ?? <></>;
  }

  return Icons[name];
};

const retrieveIconFromMaterial = (name: string, props?) => {
  const IconComponent = retrieveIconFromMaterialObjects(name);

  return <IconComponent {...props} />;
};

const retrieveSvgIconUsingMaterialComponent = (name: string, props) => {
  const materialIcon = retrieveIconFromMaterialObjects(name);

  return <SvgIcon component={materialIcon} {...props} />;
};

/*
  structure of the above getExternalAppAssets is:

      images:{
        logo: {
          url: '/public/irm-custom/images/logo.svg',
          type: 'string',
        },
      },
      icons: {
        logout: {
          url: 'ExitToAppIcon',
          type: 'material',
        },
      },

*/

const useAssetByType = (input, name) => {
  const myWindow: AnyType = window;
  const { application, getSystemAssets } = useSystem();

  if (!myWindow[getSystemAssets]) {
    return;
  }
  const externalAppAssets = myWindow[getSystemAssets];
  const getExternalAppAssets = externalAppAssets(application, alpha);

  return getExternalAppAssets[input][name ?? ''] ?? {};
};

export const useAssetTypeUrl = (input, name) => {
  const asset = useAssetByType(input, name);
  if (!asset || !asset?.url) {
    return '';
  }

  if (input === 'images') {
    return `${window['DEPLOYMENT_ENVIRONMENT']}${asset?.url ?? ''}`;
  }

  return asset?.url ?? '';
};

export const AssetByType = ({
  input,
  name,
  props,
  fallbackText,
}: {
  input: string;
  name: string;
  props?: AnyType;
  fallbackText?: string;
}) => {
  const asset = useAssetByType(input, name);
  if (!asset || isEmpty(asset)) {
    const IconComponent = defaultIcons[name];
    if (!IconComponent) {
      return (
        <Typography variant="body1">{fallbackText ?? `Could not find icon ${name}`}</Typography>
      );
    }
    return <IconComponent {...props} />;
  }
  if (asset.type === 'material') {
    return retrieveIconFromMaterial(asset.url, props);
  }
  if (asset.type === 'svgicon') {
    return retrieveSvgIconUsingMaterialComponent(asset.url, props);
  }

  return <></>;
};
