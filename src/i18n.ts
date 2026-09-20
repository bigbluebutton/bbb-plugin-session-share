import { defineMessages } from 'react-intl';

const intlMessages = defineMessages({
  toolbarInvite: {
    id: 'plugin.sessionShare.toolbar.invite',
    defaultMessage: 'Invite',
    description: 'Tooltip for the session-share action button',
  },
  shareOptions: {
    id: 'plugin.sessionShare.title.shareOptions',
    defaultMessage: 'Share Options',
    description: 'Title of the share-type selection screen',
  },
  joinMeeting: {
    id: 'plugin.sessionShare.title.joinMeeting',
    defaultMessage: 'Join This Meeting',
    description: 'Title shown above an invitation QR code',
  },
  shareCurrentSession: {
    id: 'plugin.sessionShare.title.shareCurrentSession',
    defaultMessage: 'Share Current Session',
    description: 'Title shown above a current-session QR code',
  },
  inviteOtherUsers: {
    id: 'plugin.sessionShare.option.inviteOtherUsers',
    defaultMessage: 'Invite other users',
    description: 'Option for inviting users through the frontend login URL',
  },
  shareMySession: {
    id: 'plugin.sessionShare.option.shareMySession',
    defaultMessage: 'Share my session',
    description: 'Option for sharing the current user session',
  },
  confirm: {
    id: 'plugin.sessionShare.button.confirm',
    defaultMessage: 'Confirm',
    description: 'Confirmation button',
  },
  close: {
    id: 'plugin.sessionShare.button.close',
    defaultMessage: 'Close',
    description: 'Close button',
  },
  copyUrl: {
    id: 'plugin.sessionShare.button.copyUrl',
    defaultMessage: 'Copy URL',
    description: 'Button for copying the displayed URL',
  },
  fullScreen: {
    id: 'plugin.sessionShare.button.fullScreen',
    defaultMessage: 'Full screen',
    description: 'Button for entering full-screen mode',
  },
  copied: {
    id: 'plugin.sessionShare.status.copied',
    defaultMessage: 'Copied to clipboard.',
    description: 'Message shown after copying the URL',
  },
  shareUrl: {
    id: 'plugin.sessionShare.field.shareUrl',
    defaultMessage: 'Share URL',
    description: 'Accessible label for the URL field',
  },
  popupBlocked: {
    id: 'plugin.sessionShare.error.popupBlocked',
    defaultMessage: 'The share window was blocked by the browser. Please allow pop-ups for this site.',
    description: 'Error shown when the browser blocks the share window',
  },
  meetingLoading: {
    id: 'plugin.sessionShare.error.meetingLoading',
    defaultMessage: 'Meeting information is still loading. Please try again.',
    description: 'Error shown while meeting information is loading',
  },
  invitationUrlUnavailable: {
    id: 'plugin.sessionShare.error.invitationUrlUnavailable',
    defaultMessage: 'An invitation URL was not provided for this meeting.',
    description: 'Error shown when an invitation URL was not provided',
  },
  shareUrlFailed: {
    id: 'plugin.sessionShare.error.shareUrlFailed',
    defaultMessage: 'Failed to create the share URL.',
    description: 'Generic URL creation error',
  },
  fullScreenFailed: {
    id: 'plugin.sessionShare.error.fullScreenFailed',
    defaultMessage: 'The browser could not enter full-screen mode.',
    description: 'Error shown when full-screen mode fails',
  },
  copyFailed: {
    id: 'plugin.sessionShare.error.copyFailed',
    defaultMessage: 'Could not copy the URL. The URL has been selected; copy it manually.',
    description: 'Error shown when copying the URL fails',
  },
});

export default intlMessages;
