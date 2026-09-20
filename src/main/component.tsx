import * as React from 'react';
import { useEffect, useRef } from 'react';

import {
  ActionsBarButton, ActionsBarInterface, ActionsBarPosition,
  ActionsBarSeparator, AppsGalleryEntry, BbbPluginSdk, PluginApi,
} from 'bigbluebutton-html-plugin-sdk';
import { createIntl, createIntlCache } from 'react-intl';
import { SessionSharePluginProps } from './types';
import { ShareWindow } from '../config-modal/modal';

import intlMessages from '../i18n';

const intlCache = createIntlCache();

function SessionSharePlugin({
  pluginUuid: uuid,
}: SessionSharePluginProps): React.ReactNode {
  BbbPluginSdk.initialize(uuid);
  const pluginApi: PluginApi = BbbPluginSdk.getPluginApi(uuid);
  const meetingInfoGraphqlResponse = pluginApi.useMeeting();
  const inviteUrl = meetingInfoGraphqlResponse?.data?.loginUrl?.trim() ?? '';
  const {
    messages: localeMessages,
    currentLocale,
  } = pluginApi.useLocaleMessages!();

  const intl = React.useMemo(() => createIntl({
    locale: currentLocale || 'en',
    messages: localeMessages || {},
    fallbackOnEmptyString: true,
  }, intlCache), [currentLocale, localeMessages]);

  const popupWindowRef = useRef<Window | null>(null);
  const [popupWindow, setPopupWindow] = React.useState<Window | null>(null);
  const [newJoinUrl, setNewJoinUrl] = React.useState('');

  const openShareWindow = () => {
    const currentPopup = popupWindowRef.current;

    // Forward the popup if already shown
    if (currentPopup && !currentPopup.closed) {
      currentPopup.focus();
      setPopupWindow(currentPopup);
      return;
    }

    const popupWidth = 460;
    const popupHeight = 360;

    // show the popup relative to the BBB window
    const popupLeft = Math.round(
      window.screenX
      + Math.max(0, (window.outerWidth - popupWidth) / 2),
    );

    const popupTop = Math.round(
      window.screenY
      + Math.max(0, (window.outerHeight - popupHeight) / 2),
    );

    const popup = window.open(
      '',
      'bbb-session-share',
      [
        'popup=yes',
        `width=${popupWidth}`,
        `height=${popupHeight}`,
        `left=${popupLeft}`,
        `top=${popupTop}`,
        'resizable=yes',
        'scrollbars=yes',
      ].join(','),
    );

    if (!popup) {
      window.alert(
        intl.formatMessage(intlMessages.popupBlocked),
      );
      return;
    }

    popup.document.title = intl.formatMessage(intlMessages.toolbarInvite);
    popup.document.documentElement.lang = intl.locale;
    popup.document.body.replaceChildren();

    const viewport = popup.document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1';
    popup.document.head.appendChild(viewport);

    const popupRoot = popup.document.createElement('div');
    popupRoot.id = 'session-share-root';
    popup.document.body.appendChild(popupRoot);

    const handlePopupClosed = () => {
      if (popupWindowRef.current === popup) {
        popupWindowRef.current = null;
        setPopupWindow(null);
        setNewJoinUrl('');
      }
    };

    popup.addEventListener(
      'beforeunload',
      handlePopupClosed,
      { once: true },
    );

    popupWindowRef.current = popup;
    setNewJoinUrl('');
    setPopupWindow(popup);
    popup.focus();
  };

  const closeShareWindow = () => {
    const currentPopup = popupWindowRef.current;

    popupWindowRef.current = null;
    setPopupWindow(null);
    setNewJoinUrl('');

    if (currentPopup && !currentPopup.closed) {
      currentPopup.close();
    }
  };

  // Registration to Toolbar / Apps Gellery
  useEffect(() => {
    const label = intl.formatMessage(intlMessages.toolbarInvite);

    const supportsAppsGallery = typeof pluginApi.setAppsGalleryItems === 'function';

    if (supportsAppsGallery) {
      // BBB 4.0 -> Apps Gallery
      const appsGalleryEntry = new AppsGalleryEntry({
        id: 'bbb-plugin-session-share',
        name: label,
        icon: {
          iconName: 'add',
        },
        dataTest: 'sessionShareAppsGalleryEntry',
        onClick: openShareWindow,
      });

      pluginApi.setAppsGalleryItems([
        appsGalleryEntry,
      ]);
    } else {
      // BBB 3.0 -> Action bar
      const buttonToUserListItem: ActionsBarInterface = new ActionsBarButton({
        icon: {
          iconName: 'add',
        },
        tooltip: label,
        onClick: openShareWindow,
        position: ActionsBarPosition.RIGHT,
      });

      const dropdownToUserListItem: ActionsBarInterface = new ActionsBarSeparator({
        position: ActionsBarPosition.RIGHT,
      });

      pluginApi.setActionsBarItems([
        dropdownToUserListItem,
        buttonToUserListItem,
      ]);
    }

    return () => {
      if (supportsAppsGallery) {
        pluginApi.setAppsGalleryItems([]);
      } else {
        pluginApi.setActionsBarItems([]);
      }
    };
  }, [pluginApi, intl]);

  // Close popup when BBB is closed.
  useEffect(() => () => {
    const currentPopup = popupWindowRef.current;
    popupWindowRef.current = null;

    if (currentPopup && !currentPopup.closed) {
      currentPopup.close();
    }
  }, []);

  const handleConfirm = async (shareType: string) => {
    if (shareType === 'inviteUsers') {
      if (meetingInfoGraphqlResponse?.loading) {
        throw new Error(
          intl.formatMessage(intlMessages.meetingLoading),
        );
      }
      if (!inviteUrl) {
        throw new Error(
          intl.formatMessage(intlMessages.invitationUrlUnavailable),
        );
      }

      setNewJoinUrl(inviteUrl);
      return;
    }

    const joinUrl = await pluginApi.getJoinUrl({});
    setNewJoinUrl(joinUrl);
  };

  return (
    <ShareWindow
      intl={intl}
      popupWindow={popupWindow}
      newJoinUrl={newJoinUrl}
      onClose={closeShareWindow}
      onConfirm={handleConfirm}
    />
  );
}

export default SessionSharePlugin;
