# sonara-mobile (Ionic Angular + Capacitor)

STATUS: Not started (Phase 11). Only dependency and Capacitor config exist.
Auth contract for this app: send `X-Client: mobile`; tokens come back in the JSON body
and must be stored with a secure-storage plugin (Keychain/Keystore), never localStorage.
