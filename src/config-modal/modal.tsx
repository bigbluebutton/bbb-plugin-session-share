import * as React from 'react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'react-qr-code';
import { IntlShape } from 'react-intl';
import intlMessages from '../i18n';

interface ShareWindowProps {
    intl: IntlShape;
    popupWindow: Window | null;
    newJoinUrl: string;
    onClose: () => void;
    onConfirm: (shareType: string) => Promise<void>;
}

const POPUP_STYLES = `
  :root {
    color-scheme: light;
    font-family: Arial, Helvetica, sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-width: 360px;
    min-height: 100vh;
    color: #172b4d;
    background: #f4f6f9;
  }

  button,
  input {
    font: inherit;
  }

  .session-share-window {
    width: min(100%, 600px);
    min-height: 100vh;
    margin: 0 auto;
    padding: 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #ffffff;
  }

  .session-share-window h1 {
    margin: 0 0 16px;
    font-size: 22px;
  }

  .share-options {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .share-options label {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid #d8dde6;
    border-radius: 6px;
    cursor: pointer;
  }

  .share-options input {
    margin: 0;
  }

  .share-url-field {
    display: block;
    width: 100%;
    max-width: 560px;
    margin: 0 auto 14px;
    padding: 10px;
    border: 1px solid #8993a4;
    border-radius: 4px;
  }

  .qr-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 18px;
    background: #ffffff;
  }

  .qr-code {
    width: min(320px, 80vw);
    height: auto;
  }

  .buttons-container {
    width: 100%;
    margin-top: 16px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }

  .buttons-container button {
    padding: 10px 18px;
    border: 0;
    border-radius: 5px;
    color: #ffffff;
    background: #0f70d7;
    cursor: pointer;
  }

  .buttons-container button.secondary {
    background: #022852;
  }

  .buttons-container button:disabled {
    cursor: wait;
    opacity: 0.6;
  }

  .error-message {
    margin-top: 16px;
    color: #b00020;
    text-align: center;
  }

  .copied-message {
    min-height: 22px;
    margin: 8px 0 0;
    color: #176b3a;
  }

  :fullscreen .session-share-window {
    width: 100%;
    max-width: none;
    justify-content: center;
  }

  :fullscreen .qr-code {
    width: min(65vmin, 640px);
  }
`;

export function ShareWindow({
  intl, popupWindow, newJoinUrl, onClose, onConfirm,
}: ShareWindowProps) {
  const [shareType, setShareType] = useState('inviteUsers');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const shareUrlInputRef = React.useRef<HTMLInputElement>(null);

  let screenTitle = intl.formatMessage(intlMessages.shareOptions);
  if (newJoinUrl && shareType === 'inviteUsers') {
    screenTitle = intl.formatMessage(intlMessages.joinMeeting);
  } else if (newJoinUrl) {
    screenTitle = intl.formatMessage(
      intlMessages.shareCurrentSession,
    );
  }

  // Inject CSS directly to the popup
  React.useEffect(() => {
    if (!popupWindow) return undefined;

    const style = popupWindow.document.createElement('style');
    style.dataset.sessionShare = 'true';
    style.textContent = POPUP_STYLES;
    popupWindow.document.head.appendChild(style);

    setShareType('inviteUsers');
    setLoading(false);
    setErrorMessage('');
    setCopied(false);

    return () => style.remove();
  }, [popupWindow]);

  React.useEffect(() => {
    if (!popupWindow || popupWindow.closed) return;

    if (newJoinUrl) {
      // For showing URL or QR code
      popupWindow.resizeTo(520, 700);
    } else {
      // For showing Invite/Share option
      popupWindow.resizeTo(460, 360);
    }
  }, [popupWindow, newJoinUrl]);

  const handleConfirm = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      await onConfirm(shareType);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : intl.formatMessage(intlMessages.shareUrlFailed),
      );
    } finally {
      setLoading(false);
    }
  };

  const selectShareUrl = () => {
    const input = shareUrlInputRef.current;

    if (!input) return false;

    input.focus();
    input.select();
    input.setSelectionRange(0, input.value.length);

    return true;
  };

  const handleCopyUrl = async () => {
    if (!popupWindow || !newJoinUrl) return;

    setCopied(false);
    setErrorMessage('');

    try {
      const clipboard = popupWindow.navigator.clipboard;

      if (clipboard && popupWindow.isSecureContext) {
        await clipboard.writeText(newJoinUrl);
        setCopied(true);
        return;
      }

      // fallback for browsers without clipboard API
      const selected = selectShareUrl();
      const copiedByCommand = selected
        && popupWindow.document.execCommand('copy');

      if (!copiedByCommand) {
        throw new Error('Copy command failed');
      }

      setCopied(true);
    } catch (error) {
      // Try old copy command when Clipboard API is denied
      try {
        const selected = selectShareUrl();
        const copiedByCommand = selected
          && popupWindow.document.execCommand('copy');

        if (copiedByCommand) {
          setCopied(true);
          return;
        }
      } catch (fallbackError) {
      }

      // Enable manual copying even when every copying method failed
      selectShareUrl();

      setErrorMessage(
        intl.formatMessage(intlMessages.copyFailed),
      );
    }
  };

  const handleFullscreen = async () => {
    if (!popupWindow) return;

    try {
      if (popupWindow.document.fullscreenElement) {
        await popupWindow.document.exitFullscreen();
      } else {
        await popupWindow.document.documentElement.requestFullscreen();
      }
    } catch (error) {
      setErrorMessage(
        intl.formatMessage(intlMessages.fullScreenFailed),
      );
    }
  };

  if (!popupWindow) return null;

  const popupRoot = popupWindow.document.getElementById(
    'session-share-root',
  );

  if (!popupRoot) return null;

  return createPortal(
    <main className="session-share-window">
      <h1>{screenTitle}</h1>

      {!newJoinUrl ? (
        <>
          <form className="share-options">
            <label htmlFor="invite-others">
              <input
                type="radio"
                name="shareType"
                id="invite-others"
                value="inviteUsers"
                checked={shareType === 'inviteUsers'}
                onChange={() => setShareType('inviteUsers')}
              />
              {intl.formatMessage(intlMessages.inviteOtherUsers)}
            </label>

            <label htmlFor="share-mine">
              <input
                type="radio"
                name="shareType"
                id="share-mine"
                value="shareSession"
                checked={shareType === 'shareSession'}
                onChange={() => setShareType('shareSession')}
              />
              {intl.formatMessage(intlMessages.shareMySession)}
            </label>
          </form>

          {errorMessage ? (
            <div className="error-message" role="alert">
              {errorMessage}
            </div>
          ) : null}

          <div className="buttons-container">
            <button
              type="button"
              disabled={loading}
              onClick={handleConfirm}
            >
              {intl.formatMessage(intlMessages.confirm)}
            </button>

            <button
              type="button"
              className="secondary"
              disabled={loading}
              onClick={onClose}
            >
              {intl.formatMessage(intlMessages.close)}
            </button>
          </div>
        </>
      ) : (
        <>
          <input
            ref={shareUrlInputRef}
            type="text"
            className="share-url-field"
            value={newJoinUrl}
            readOnly
            aria-label={intl.formatMessage(intlMessages.shareUrl)}
            onFocus={(event) => event.currentTarget.select()}
          />

          <div className="qr-wrapper">
            <QRCode
              className="qr-code"
              size={320}
              value={newJoinUrl}
              viewBox="0 0 320 320"
            />
          </div>

          <div className="copied-message" aria-live="polite">
            {copied ? intl.formatMessage(intlMessages.copied) : ''}
          </div>

          {errorMessage ? (
            <div className="error-message" role="alert">
              {errorMessage}
            </div>
          ) : null}

          <div className="buttons-container">
            <button
              type="button"
              onClick={handleCopyUrl}
            >
              {intl.formatMessage(intlMessages.copyUrl)}
            </button>

            <button
              type="button"
              onClick={handleFullscreen}
            >
              {intl.formatMessage(intlMessages.fullScreen)}
            </button>

            <button
              type="button"
              className="secondary"
              onClick={onClose}
            >
	      {intl.formatMessage(intlMessages.close)}
            </button>
          </div>
        </>
      )}
    </main>,
    popupRoot,
  );
}
