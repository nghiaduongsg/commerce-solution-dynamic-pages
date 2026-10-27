import React, { useState, useCallback, useEffect } from 'react';
import { Badge, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { formatMessage } from '@pkg-common/utils/utils';
import useNotifiers from '@pkg-common/notifier/useNotifiers';
import useSystem from '@pkg-setup/src/system/useSystem';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import PopoverMenu from '@pkg-common/atomics/PopoverMenu/PopoverMenu';
import useServerEvents from '@pkg-setup/src/serverEvents/useServerEvents';
import useUser from '@pkg-setup/src/user/useUser';
import axios from 'axios';
import { downloadFile } from '@pkg-form/validations/utils/formUtils';
import ValidationsProvider from '@pkg-form/validations/ValidationsProvider';
import useStyles from './style';
import FormManagerProvider from '@pkg-form/FormManagerProvider';

export const OUTBOUND_AGREEMENT = 'IssOutBoundAgreement';
export const INBOUND_AGREEMENT = 'IssInBoundAgreement';

const ENTITY_API_PATH_MAP = {
  ScheduledProcessInstance: 'process-management/scheduled-process-instances',
  FormDefinition: 'ui-configuration/forms',
  BillSegment: 'taxpayer-accounting/bill-segments',
  PaymentFile: 'taxpayer-accounting/payment-files',
};

const irmButtons = {
  style: 'button',
  buttons: [
    {
      type: 'redirect',
      icon: 'LINK',
      style: 'simple',
      permissionKey: 'ENTITY/notification/notifications/{id}/PUT',
      visibilityFrom: {
        fields: [
          {
            key: 'entityCL',
            checkWhen: ['Contact'],
            operator: 'not',
            source: {
              type: 'STORE',
              code: 'ServerEvents',
              jsonPath: ['entityCL'],
            },
          },
        ],
      },
      values: {
        url: '{entityCL}/{entityId}',
        replacements: [
          {
            key: '{entityCL}',
            source: {
              code: 'Notification',
              jsonPath: ['entityCL'],
            },
          },
          {
            key: '{entityId}',
            source: {
              code: 'Notification',
              jsonPath: ['entityId'],
            },
          },
        ],
      },
    },
    {
      type: 'download',
      icon: 'CloudDownloadSharp',
      style: 'simple',
      permissionKey: 'ENTITY/contact-management/contacts/{id}/download/GET',
      values: {
        resourceId: 'Contact',
        url: 'contact-management/contacts/{id}/download',
        method: 'get',
        replacements: [
          {
            key: '{id}',
            source: {
              code: 'Notification',
              jsonPath: ['entityId'],
            },
          },
        ],
      },
      visibilityFrom: {
        fields: [
          {
            key: 'entityCL',
            checkWhen: ['Contact'],
            source: {
              code: 'Notification',
              jsonPath: ['entityCL'],
            },
          },
        ],
      },
    },
    {
      type: 'Read',
      icon: 'VIEW',
      style: 'simple',
      permissionKey: 'ENTITY/notification/notifications/{id}/PUT',
      values: {
        url: 'notification/notifications/{id}',
        resourceId: 'markAsRead',
        method: 'put',
        replacements: [
          {
            key: '{id}',
            source: {
              code: 'Notification',
              jsonPath: ['notificationId'],
            },
          },
        ],
      },
      visibilityFrom: {
        operator: 'every',
        fields: [
          {
            key: 'status',
            checkWhen: ['Unread'],
            source: {
              code: 'Notification',
              jsonPath: ['status'],
            },
          },
        ],
      },
    },
  ],
};
const issButtons = {
  style: 'button',
  buttons: [
    {
      type: 'redirect',
      icon: 'LINK',
      style: 'simple',
      permissionKey: 'ENTITY/notification/notifications/{id}/PUT',
      visibilityFrom: {
        fields: [
          {
            key: 'entityCL',
            checkWhen: ['Contact'],
            operator: 'not',
            source: {
              type: 'STORE',
              code: 'ServerEvents',
              jsonPath: ['entityCL'],
            },
          },
        ],
      },
      values: {
        url: '{entityCL}/{entityId}',
        replacements: [
          {
            key: '{entityCL}',
            source: {
              code: 'Notification',
              jsonPath: ['entityCL'],
            },
          },
          {
            key: '{entityId}',
            source: {
              code: 'Notification',
              jsonPath: ['entityId'],
            },
          },
        ],
      },
    },
    {
      type: 'download',
      icon: 'CloudDownloadSharp',
      style: 'simple',
      permissionKey: 'ENTITY/contact-management/contacts/{id}/download/GET',
      values: {
        resourceId: 'Contact',
        url: 'iss-service-management/contacts/{id}/download',
        method: 'get',
        replacements: [
          {
            key: '{id}',
            source: {
              code: 'Notification',
              jsonPath: ['entityId'],
            },
          },
        ],
      },
      visibilityFrom: {
        fields: [
          {
            key: 'entityCL',
            checkWhen: ['Contact'],
            source: {
              code: 'Notification',
              jsonPath: ['entityCL'],
            },
          },
        ],
      },
    },
    {
      type: 'Read',
      icon: 'VIEW',
      style: 'simple',
      permissionKey: 'ENTITY/notification/notifications/{id}/PUT',
      values: {
        url: 'notification/notifications/{id}',
        resourceId: 'markAsRead',
        method: 'put',
        replacements: [
          {
            key: '{id}',
            source: {
              code: 'Notification',
              jsonPath: ['notificationId'],
            },
          },
        ],
      },
      visibilityFrom: {
        operator: 'every',
        fields: [
          {
            key: 'status',
            checkWhen: ['Unread'],
            source: {
              code: 'Notification',
              jsonPath: ['status'],
            },
          },
        ],
      },
    },
  ],
};

const Notifications = () => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { selectedLanguage, application, apiUrl } = useSystem();
  const navigate = useNavigate();
  const { t: translate } = useTranslation([ACCESSIBILITY, COMMON]);
  const { notifications, fetchFirst, markAsRead, count } = useServerEvents();
  const { userId } = useUser();
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useNotifiers();

  const handleLinkPressIRM = useCallback(
    (event, notificationId) => {
      if (event.status === 'Unread') {
        markAsRead(notificationId)
          .then(() => {
            fetchFirst();
          })
          .catch((error) => {
            console.error('Error marking notification as read:', error);
          });
      }

      const routeKey = event.entityCL.replace(' ', '');

      if (routeKey === 'PersonalCalendar') {
        const pathName = `/page/PersonalCalendar/${event.userCode}`;
        navigate(pathName);
        setOpen(false);
        return;
      }

      const pathName = `/page/${routeKey}/${event.entityId}`;
      const apiPath = ENTITY_API_PATH_MAP[event.entityCL];
      if (!apiPath) {
        navigate(pathName);
      }

      axios
        .get(`${apiUrl}/${apiPath}/${event.entityId}`)
        .then((_) => {
          navigate(pathName);
        })
        .catch((error) => {
          enqueueSnackbar({
            key: new Date().getTime().toString(),
            message: translate('noRecords', {
              ns: COMMON,
              lng: selectedLanguage,
            }),
            severity: 'error',
          });
          if (error.response) {
            console.error('An error occurred:', error.message);
          }
        });
      setOpen(false);
    },
    [navigate, markAsRead],
  );

  const handleLinkPressISS = useCallback(
    (event, notificationId) => {
      if (event.status === 'Unread') {
        markAsRead(notificationId)
          .then(() => {
            fetchFirst();
          })
          .catch((error) => {
            console.error('Error marking notification as read:', error);
          });
      }

      if (event.entityCL === 'Agreement') {
        const id = event.entityId;
        axios
          .get(`${apiUrl}/iss-service-management/agreements/${id}`)
          .then((response) => {
            const agreement = response.data;
            if (agreement?.fromPortalUser?.id === userId) {
              navigate(`/page/${OUTBOUND_AGREEMENT}/${id}`);
            } else if (agreement?.toPortalUser?.id === userId) {
              navigate(`/page/${INBOUND_AGREEMENT}/${id}`);
            }
          })
          .catch((error) => {
            if (error.response) {
              console.error('An error occurred:', error.message);
            }
          });
      } else if (event.entityCL == 'FormDefinition') {
        const id = event.entityId;
        axios
          .get(`${apiUrl}/ui-configuration/self-service-forms/${id}`)
          .then((response) => {
            const formDefinition = response.data;
            const formTypeCode = formDefinition?.formTypeCode;
            navigate(`/page/FormDefinition/${id}?subType=${formTypeCode}`);
          })
          .catch((error) => {
            if (error.response) {
              console.error('An error occurred:', error.message);
            }
          });
      } else if (event.entityCL === 'Contact') {
        downloadFile(
          `iss-service-management/contacts/${event.entityId}/download`,
          `Notification_${new Date().getTime()}`,
          apiUrl,
        ).catch((error) => {
          if (error.response) {
            console.error('An error occurred:', error.message);
          }
        });
      } else {
        const routeKey = event.entityCL.replace(' ', '');
        const pathName = `/page/${routeKey}/${event.entityId}`;

        navigate(pathName);
      }

      setOpen(false);
    },
    [navigate, markAsRead, userId],
  );

  const onNotificationClick = useCallback(
    (event, id) => {
      return application === 'ISS' ? handleLinkPressISS(event, id) : handleLinkPressIRM(event, id);
    },
    [application, handleLinkPressISS, handleLinkPressIRM],
  );

  const getPopoverMenuActions = useCallback(() => {
    return [
      {
        id: 'viewAllNotifications',
        label: (
          <div style={{ fontWeight: 'bold' }}>
            {translate('viewAllNotifications', { ns: ACCESSIBILITY, lng: selectedLanguage })}
          </div>
        ),
        onClick: () => {
          application === 'ISS'
            ? navigate('/page/IssNotifications')
            : navigate('/page/Notification/list');
          setOpen(false);
        },
      },
      ...(notifications || []).map((event) => ({
        id: `${event.entityCL}-${event.notificationId}`,
        label: (
          <>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
                justifyContent: 'space-between',
              }}
            >
              <Typography
                sx={event.status === 'Unread' ? styles.typographyUnread : styles.typographyRead}
              >
                {event.entityCLDescription === 'Contact' ? 'Letter' : event.entityCLDescription}
              </Typography>
              <AppActions
                page={{ id: event.notificationId }}
                actions={(application === 'ISS' ? issButtons : irmButtons) as any}
                source={event}
                checkPermissions={false}
              />
            </div>
            <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
              {formatMessage(event.message, event.parameters, translate, selectedLanguage)}
            </Typography>
          </>
        ),
        onClick: () => onNotificationClick(event, event.notificationId),
      })),
    ];
  }, [notifications, translate, navigate, onNotificationClick]);

  const handleMenuOpen = () => {
    fetchFirst();
    setOpen(true);
  };

  const handleMenuClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    fetchFirst();
  }, [fetchFirst]);

  return (
    <ValidationsProvider>
      <FormManagerProvider>
        <PopoverMenu
          id="notifications-menu-options"
          dataTestId="user-notifications-btn"
          icon={
            count > 0 ? (
              <Badge
                badgeContent={count}
                color="primary"
                sx={(theme) => ({
                  '& .MuiBadge-badge': {
                    ...theme.typography.body1,
                    marginLeft: 6,
                  },
                })}
                aria-label={translate('unreadNotificationsBadge', {
                  ns: ACCESSIBILITY,
                  lng: selectedLanguage,
                })}
              >
                <AssetByType input="icons" name="Notifications" />
              </Badge>
            ) : (
              <AssetByType input="icons" name="Notifications" />
            )
          }
          label={translate('notifications', {
            ns: COMMON,
            unreadNotifications: count,
            lng: selectedLanguage,
          })}
          ariaDescription={translate('notificationsButtonDescription', {
            ns: ACCESSIBILITY,
            unreadNotifications: count,
            lng: selectedLanguage,
          })}
          actions={getPopoverMenuActions()}
          onOpen={handleMenuOpen}
          onClose={handleMenuClose}
          isOpen={open}
          sx={(notifications && notifications.length > 1 ? styles.menuItem : '') as any}
        />
      </FormManagerProvider>
    </ValidationsProvider>
  );
};

export default Notifications;
