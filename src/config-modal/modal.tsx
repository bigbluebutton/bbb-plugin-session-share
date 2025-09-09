// modal.tsx
import * as React from 'react';
import { useState } from 'react';
import * as ReactModal from 'react-modal';
import './style.css';
import QRCode from 'react-qr-code';
import { CopyToClipboard } from 'react-copy-to-clipboard';

interface ShareModalProps {
    isOpen: boolean;
    newJoinUrl: string;
    onClose: () => void;
    onConfirm: (shareType: string) => void;
}

export function ShareModal({
  isOpen, newJoinUrl, onClose, onConfirm,
}: ShareModalProps) {
  const [shareType, setShareType] = useState('shareSession');
  const [loading, setLoading] = useState(false);

  // This is required for accessibility reasons.
  // You can alternatively set it on your root app component during app initialization.
  ReactModal.setAppElement('#app'); // Adjust '#root' to match your application's mount node ID.

  React.useEffect(() => {
    if (isOpen) {
      setLoading(false);
    }
  }, [isOpen]);

  return isOpen && (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Share Options Modal"
      className="plugin-modal session-share-plugin"
      portalClassName="modal-low"
      parentSelector={() => document.querySelector('#modals-container')}
      overlayClassName="modal-overlay"
    >
      <div
        style={{
          width: '100%', height: '100%', alignItems: 'center', display: 'flex', flexDirection: 'column',
        }}
      >
        <h2>Share Options</h2>
        {
            /** Join URL not created */
            !newJoinUrl
              ? (
                <>
                  <form>
                    <label htmlFor="share-mine">
                      <input
                        type="radio"
                        name="shareType"
                        id="share-mine"
                        value="shareSession"
                        checked={shareType === 'shareSession'}
                        onChange={() => setShareType('shareSession')}
                      />
                      Share my session
                    </label>
                    <label htmlFor="invite-others">
                      <input
                        type="radio"
                        name="shareType"
                        id="invite-others"
                        value="inviteUsers"
                        checked={shareType === 'inviteUsers'}
                        onChange={() => setShareType('inviteUsers')}
                      />
                      Invite other users
                    </label>
                  </form>
                  <div className="buttons-container">
                    <button type="button" disabled={loading} onClick={() => { onConfirm(shareType); setLoading(true); }}>Confirm</button>
                    <button type="button" disabled={loading} onClick={onClose}>Close</button>
                  </div>
                </>
              ) : null
            }
        {
            /** Join URL available */
            newJoinUrl
              ? (
                <>
                  <CopyToClipboard text={newJoinUrl} onCopy={onClose}>
                    <div className="copy-button-wrapper">
                      <i className="icon-bbb-copy" />
                      {' '}
                      Copy
                    </div>
                  </CopyToClipboard>
                  <QRCode
                    size={128}
                    style={{ height: '128', maxWidth: '128', width: '128' }}
                    value={newJoinUrl}
                    viewBox="0 0 128 128"
                  />

                  <div className="buttons-container">
                    <button type="button" onClick={onClose}>Close</button>
                  </div>
                </>
              ) : null
            }
      </div>
    </ReactModal>
  );
}
