/**
 * EduSpace / ND Labs — Canonical Auth Client Adapter (Phase 01-C3)
 * 
 * Centralized, authoritative client SDK adapter that coordinates:
 * 1. Server-side registration via /registerUser.
 * 2. Server-side login (NDID or Email) via /loginUser.
 * 3. Firebase Custom Token sign-in with strict invariant verification (UID === CodeID).
 * 4. Authoritative auth state listener via Firebase Web SDK onAuthStateChanged.
 * 5. Dynamic profile attribute resolution from users/{CodeID}.
 * 6. Authenticated self-service: changePassword and changeNdid (with 30d cooldown).
 * 7. Route protection helpers and standardized UI error mapping.
 * 
 * Strict Invariants:
 * - CodeID is the sole immutable account identity.
 * - LocalStorage is NEVER the authority for authentication or permissions.
 * - Fail-closed: If Firebase Auth UID !== CodeID, the session is terminated immediately.
 */

(function (window) {
  'use strict';

  // Base API configuration (Production Vercel Serverless Functions API with CORS for localhost)
  const CLOUD_FUNCTIONS_BASE = 'https://nd-puce.vercel.app/api';

  const ENDPOINTS = {
    register: `${CLOUD_FUNCTIONS_BASE}/registerUser`,
    login: `${CLOUD_FUNCTIONS_BASE}/loginUser`,
    changePassword: `${CLOUD_FUNCTIONS_BASE}/changePassword`,
    changeNdid: `${CLOUD_FUNCTIONS_BASE}/changeNdid`,
    linkGoogle: `${CLOUD_FUNCTIONS_BASE}/linkGoogleIdentity`,
    unlinkGoogle: `${CLOUD_FUNCTIONS_BASE}/unlinkGoogleIdentity`,
    requestRecoveryCode: `${CLOUD_FUNCTIONS_BASE}/requestRecoveryCode`,
    verifyRecoveryCode: `${CLOUD_FUNCTIONS_BASE}/verifyRecoveryCode`,
    resetPasswordWithRecovery: `${CLOUD_FUNCTIONS_BASE}/resetPasswordWithRecovery`,
    registerSession: `${CLOUD_FUNCTIONS_BASE}/registerSession`,
    getActiveSessions: `${CLOUD_FUNCTIONS_BASE}/getActiveSessions`,
    revokeSession: `${CLOUD_FUNCTIONS_BASE}/revokeSession`,
    revokeOtherSessions: `${CLOUD_FUNCTIONS_BASE}/revokeOtherSessions`,
    registerTrustedDevice: `${CLOUD_FUNCTIONS_BASE}/registerTrustedDevice`,
    getTrustedDevices: `${CLOUD_FUNCTIONS_BASE}/getTrustedDevices`,
    revokeTrustedDevice: `${CLOUD_FUNCTIONS_BASE}/revokeTrustedDevice`,
    getSecurityActivity: `${CLOUD_FUNCTIONS_BASE}/getSecurityActivity`,
    loginWithGoogle: `${CLOUD_FUNCTIONS_BASE}/loginWithGoogle`,
    updateUserRole: `${CLOUD_FUNCTIONS_BASE}/updateUserRole`,
    adminGetUsers: `${CLOUD_FUNCTIONS_BASE}/adminGetUsers`,
    sendVerificationEmail: `${CLOUD_FUNCTIONS_BASE}/sendVerificationEmail`,
    verifyEmail: `${CLOUD_FUNCTIONS_BASE}/verifyEmail`,
  };

  /**
   * Internal state
   */
  let _currentAuthState = 'loading'; // 'loading' | 'authenticated' | 'unauthenticated' | 'error'
  let _currentCodeId = null;
  let _currentFirebaseUser = null;
  let _currentUserProfile = null;
  const _listeners = new Set();

  /**
   * Generates or retrieves the unique session ID for this browser tab
   */
  function _getCurrentSessionId() {
    try {
      let sId = sessionStorage.getItem('nd_canonical_session_id');
      if (!sId) {
        sId = `ses_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        sessionStorage.setItem('nd_canonical_session_id', sId);
      }
      return sId;
    } catch {
      return `ses_${Date.now()}_temp`;
    }
  }

  /**
   * Generates or retrieves the persistent device ID for this browser
   */
  function _getCurrentDeviceId() {
    try {
      let dId = localStorage.getItem('nd_canonical_device_id');
      if (!dId) {
        dId = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        localStorage.setItem('nd_canonical_device_id', dId);
      }
      return dId;
    } catch {
      return `dev_${Date.now()}_temp`;
    }
  }

  /**
   * Helper: Get Firebase Web SDK instances
   */
  function getFirebaseAuth() {
    return window.firebaseAuth || (window.firebase && window.firebase.auth && window.firebase.auth()) || null;
  }

  function getFirebaseFirestore() {
    return window.firebaseFirestore || (window.firebase && window.firebase.firestore && window.firebase.firestore()) || null;
  }

  /**
   * Notify all registered auth listeners
   */
  function _notifyStateChange() {
    const payload = {
      state: _currentAuthState,
      codeId: _currentCodeId,
      firebaseUser: _currentFirebaseUser,
      profile: _currentUserProfile,
    };
    _listeners.forEach((callback) => {
      try {
        callback(payload);
      } catch (err) {
        console.error('[CanonicalAuth] Error in auth listener callback:', err);
      }
    });

    // Dispatch global CustomEvent for non-modular vanilla scripts
    window.dispatchEvent(new CustomEvent('nd-auth-state-changed', { detail: payload }));
  }

  /**
   * Resolves safe user profile from users/{CodeID}
   * @param {string} codeId
   * @returns {Promise<Object | null>}
   */
  async function _resolveProfileFromFirestore(codeId) {
    const db = getFirebaseFirestore();
    if (!db || !codeId) return null;

    try {
      // Handle both Modular SDK (getDoc/doc) and Compat SDK (db.collection().doc().get())
      if (typeof db.collection === 'function') {
        const snap = await db.collection('users').doc(codeId).get();
        if (snap.exists) {
          return snap.data();
        }
      } else if (window.getDoc && window.doc) {
        const snap = await window.getDoc(window.doc(db, 'users', codeId));
        if (snap.exists()) {
          return snap.data();
        }
      }
    } catch (err) {
      console.warn('[CanonicalAuth] Could not load profile from Firestore:', err.message);
    }
    return null;
  }

  /**
   * Synchronizes user profile to legacy NDAccounts storage for seamless backward compatibility,
   * without ever treating localStorage as the security authority.
   */
  function _syncLegacyPresentationStorage(profile, firebaseUser) {
    if (!profile && !firebaseUser) {
      try {
        localStorage.removeItem('nd_user');
      } catch {}
      return;
    }

    const legacyPayload = {
      uid: firebaseUser ? firebaseUser.uid : (profile ? profile.codeId : ''),
      codeId: profile ? profile.codeId : (firebaseUser ? firebaseUser.uid : ''),
      ndid: profile ? profile.ndid : '',
      displayName: profile ? (profile.displayName || profile.name) : (firebaseUser?.displayName || 'ND Member'),
      name: profile ? profile.name : '',
      email: profile ? profile.email : (firebaseUser?.email || ''),
      photoURL: profile ? (profile.photoURL || '/assets/images/logo.png') : (firebaseUser?.photoURL || '/assets/images/logo.png'),
      role: profile ? (profile.role || 'member') : 'member',
      adminLevel: profile ? profile.adminLevel : null,
      status: profile ? profile.status : 'active',
      eduRole: profile ? (profile.eduRole || 'student') : 'student',
    };

    try {
      if (window.NDAccounts && typeof window.NDAccounts.saveAccount === 'function') {
        window.NDAccounts.saveAccount(legacyPayload, true);
      } else {
        localStorage.setItem('nd_user', JSON.stringify(legacyPayload));
      }
    } catch {}
  }

  /**
   * Establishes the authoritative Firebase Auth listener
   */
  async function _initAuthBootstrap() {
    const auth = getFirebaseAuth();
    if (!auth) {
      // Retry once firebase is ready
      window.addEventListener('firebase-ready', _initAuthBootstrap, { once: true });
      return;
    }

    const authCallback = async (user) => {
      if (!user) {
        _currentAuthState = 'unauthenticated';
        _currentCodeId = null;
        _currentFirebaseUser = null;
        _currentUserProfile = null;
        _syncLegacyPresentationStorage(null, null);
        _notifyStateChange();
        return;
      }

      // STRICT INVARIANT CHECK: In canonical architecture, UID === CodeID!
      const codeId = user.uid;
      _currentFirebaseUser = user;
      _currentCodeId = codeId;

      // Load canonical profile from users/{CodeID}
      const profile = await _resolveProfileFromFirestore(codeId);
      _currentUserProfile = profile;

      // Invariant check: Profile codeId must match auth UID if profile exists
      if (profile && profile.codeId && profile.codeId !== codeId) {
        console.error(`[CanonicalAuth] Critical Invariant Mismatch: auth.uid [${codeId}] !== profile.codeId [${profile.codeId}]. Terminating session.`);
        if (typeof auth.signOut === 'function') {
          await auth.signOut();
        } else {
          const { signOut } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");
          await signOut(auth);
        }
        _currentAuthState = 'error';
        _notifyStateChange();
        return;
      }

      _currentAuthState = 'authenticated';
      _syncLegacyPresentationStorage(profile, user);
      _notifyStateChange();

      // Automatically register active session in the background (Phase 01-C6 Task 4)
      canonicalAuth.registerCurrentSession().catch(() => {});
    };

    if (typeof auth.onAuthStateChanged === 'function') {
      return auth.onAuthStateChanged(authCallback);
    } else if (window.onAuthStateChanged) {
      return window.onAuthStateChanged(auth, authCallback);
    } else {
      try {
        const { onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");
        return onAuthStateChanged(auth, authCallback);
      } catch (err) {
        console.error('[CanonicalAuth] Could not bind onAuthStateChanged:', err);
      }
    }
  }

  // Initialize bootstrap when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _initAuthBootstrap);
  } else {
    _initAuthBootstrap();
  }

  /**
   * Canonical Auth API Object
   */
  const canonicalAuth = {
    /**
     * Subscribes to auth state changes.
     * @param {Function} callback
     * @returns {Function} Unsubscribe function
     */
    onAuthStateChanged(callback) {
      if (typeof callback !== 'function') return () => {};
      _listeners.add(callback);
      // Immediately call with current state
      callback({
        state: _currentAuthState,
        codeId: _currentCodeId,
        firebaseUser: _currentFirebaseUser,
        profile: _currentUserProfile,
      });
      return () => _listeners.delete(callback);
    },

    /**
     * Gets current canonical state synchronously
     */
    getState() {
      return _currentAuthState;
    },

    getCurrentCodeId() {
      return _currentCodeId;
    },

    getCurrentUser() {
      return _currentFirebaseUser;
    },

    getUserProfile() {
      return _currentUserProfile;
    },

    getCurrentProfile() {
      return _currentUserProfile;
    },

    /**
     * Re-fetches current user's profile from users/{CodeID}
     */
    async refreshUserProfile() {
      if (!_currentCodeId) return null;
      const profile = await _resolveProfileFromFirestore(_currentCodeId);
      _currentUserProfile = profile;
      _syncLegacyPresentationStorage(profile, _currentFirebaseUser);
      _notifyStateChange();
      return profile;
    },

    /**
     * Registers a new canonical account.
     * @param {Object} params
     * @param {string} params.ndid
     * @param {string} params.password
     * @param {string} [params.email]
     * @param {string} [params.name]
     * @param {string} [params.displayName]
     * @param {string} [params.idempotencyKey]
     * @returns {Promise<{ success: boolean, codeId: string, user: Object }>}
     */
    async register({ ndid, password, email, name, displayName, idempotencyKey }) {
      const response = await fetch(ENDPOINTS.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ndid,
          password,
          email: email || null,
          name: name || displayName || ndid,
          displayName: displayName || name || ndid,
          idempotencyKey: idempotencyKey || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg = data.error?.message || 'Đăng ký không thành công. Vui lòng thử lại.';
        const err = new Error(errorMsg);
        err.code = data.error?.code || 'REGISTRATION_FAILED';
        throw err;
      }

      // Step 2: Sign in to Firebase Client SDK using issued Custom Token
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error('Firebase Auth chưa sẵn sàng trên trình duyệt.');
      }

      let userCredential;
      if (typeof auth.signInWithCustomToken === 'function') {
        userCredential = await auth.signInWithCustomToken(data.customToken);
      } else if (window.signInWithCustomToken) {
        userCredential = await window.signInWithCustomToken(auth, data.customToken);
      } else {
        throw new Error('Không tìm thấy phương thức signInWithCustomToken.');
      }

      // Invariant verification: UID must match returned CodeID
      const signedInUid = userCredential.user ? userCredential.user.uid : auth.currentUser?.uid;
      if (signedInUid !== data.codeId) {
        await auth.signOut();
        throw new Error('Xác thực danh tính thất bại: Mã người dùng không khớp.');
      }

      // Profile refresh
      await this.refreshUserProfile();

      return {
        success: true,
        codeId: data.codeId,
        user: data.user,
      };
    },

    /**
     * Authenticates with NDID or Email via canonical login endpoint.
     * @param {Object} params
     * @param {string} params.identifier - NDID or Email
     * @param {string} params.password
     * @returns {Promise<{ success: boolean, codeId: string, user: Object }>}
     */
    async login({ identifier, password }) {
      const response = await fetch(ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg = data.error?.message || 'Thông tin đăng nhập không chính xác.';
        const err = new Error(errorMsg);
        err.code = data.error?.code || 'AUTH_CREDENTIALS_INVALID';
        throw err;
      }

      // Sign in with issued Custom Token
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error('Firebase Auth chưa sẵn sàng trên trình duyệt.');
      }

      let userCredential;
      if (typeof auth.signInWithCustomToken === 'function') {
        userCredential = await auth.signInWithCustomToken(data.customToken);
      } else if (window.signInWithCustomToken) {
        userCredential = await window.signInWithCustomToken(auth, data.customToken);
      } else {
        throw new Error('Không tìm thấy phương thức signInWithCustomToken.');
      }

      // Invariant verification: UID must match returned CodeID
      const signedInUid = userCredential.user ? userCredential.user.uid : auth.currentUser?.uid;
      if (signedInUid !== data.codeId) {
        await auth.signOut();
        throw new Error('Xác thực danh tính thất bại: Mã người dùng không khớp.');
      }

      // Profile refresh
      await this.refreshUserProfile();

      return {
        success: true,
        codeId: data.codeId,
        user: data.user,
      };
    },

    /**
     * Signs out the current user session.
     */
    async logout() {
      const auth = getFirebaseAuth();
      const sId = _getCurrentSessionId();
      if (auth && auth.currentUser) {
        try {
          const idToken = await auth.currentUser.getIdToken();
          await fetch(ENDPOINTS.revokeSession, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({ sessionId: sId, currentSessionId: sId }),
          }).catch(() => {});
        } catch (_) {}
        await auth.signOut();
      }
      try {
        sessionStorage.removeItem('nd_canonical_session_id');
      } catch (_) {}
      _currentAuthState = 'unauthenticated';
      _currentCodeId = null;
      _currentFirebaseUser = null;
      _currentUserProfile = null;
      _syncLegacyPresentationStorage(null, null);
      _notifyStateChange();
    },

    /**
     * Self-Service: Changes password for currently authenticated user.
     * @param {Object} params
     * @param {string} params.currentPassword
     * @param {string} params.newPassword
     * @returns {Promise<{ success: boolean, message: string }>}
     */
    async changePassword({ currentPassword, newPassword }) {
      const auth = getFirebaseAuth();
      if (!auth || !auth.currentUser) {
        throw new Error('Bạn cần đăng nhập để thực hiện đổi mật khẩu.');
      }

      const idToken = await auth.currentUser.getIdToken();

      const response = await fetch(ENDPOINTS.changePassword, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg = data.error?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.';
        const err = new Error(errorMsg);
        err.code = data.error?.code || 'INVALID_REQUEST';
        throw err;
      }

      return data;
    },

    /**
     * Self-Service: Changes NDID for currently authenticated user.
     * Old NDID is placed into 30-day reservation cooldown.
     * @param {Object} params
     * @param {string} params.newNdid
     * @returns {Promise<{ success: boolean, ndid: string, cooldownDays: number }>}
     */
    async changeNdid({ newNdid }) {
      const auth = getFirebaseAuth();
      if (!auth || !auth.currentUser) {
        throw new Error('Bạn cần đăng nhập để đổi NDID.');
      }

      const idToken = await auth.currentUser.getIdToken();

      const response = await fetch(ENDPOINTS.changeNdid, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          newNdid,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg = data.error?.message || 'Không thể đổi NDID. Vui lòng thử lại.';
        const err = new Error(errorMsg);
        err.code = data.error?.code || 'INVALID_REQUEST';
        throw err;
      }

      // Refresh canonical profile to reflect new NDID
      await this.refreshUserProfile();

      return data;
    },

    /**
     * Self-Service: Links a verified Google identity to currently authenticated account (Phase 01-C4).
     * @param {Object} [params]
     * @param {string} [params.googleSubjectId]
     * @param {string} [params.googleEmail]
     * @returns {Promise<{ success: boolean, codeId: string, googleSubjectId: string, googleEmail: string | null }>}
     */
    async linkGoogle({ googleSubjectId = null, googleEmail = null } = {}) {
      const auth = getFirebaseAuth();
      if (!auth || !auth.currentUser) {
        throw new Error('Bạn cần đăng nhập để liên kết tài khoản Google.');
      }

      let resolvedSubjectId = googleSubjectId;
      let resolvedEmail = googleEmail;

      // Automatically inspect providerData if not passed directly
      if (!resolvedSubjectId) {
        const googleProvider = (auth.currentUser.providerData || []).find(p => p.providerId === 'google.com');
        if (googleProvider) {
          resolvedSubjectId = googleProvider.uid;
          resolvedEmail = resolvedEmail || googleProvider.email || null;
        }
      }

      const idToken = await auth.currentUser.getIdToken();

      const response = await fetch(ENDPOINTS.linkGoogle, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          googleSubjectId: resolvedSubjectId || null,
          googleEmail: resolvedEmail || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Roll back provider on client if backend rejected (e.g. conflict)
        try {
          if (typeof auth.currentUser.unlink === 'function') {
            await auth.currentUser.unlink('google.com');
          } else if (window.unlink) {
            await window.unlink(auth.currentUser, 'google.com');
          }
        } catch (_) {}

        const errorMsg = data.error?.message || 'Không thể liên kết Google. Vui lòng thử lại.';
        const err = new Error(errorMsg);
        err.code = data.error?.code || 'GOOGLE_LINK_FAILED';
        throw err;
      }

      // Refresh canonical profile to reflect newly linked Google info
      await this.refreshUserProfile();

      return data;
    },

    /**
     * Self-Service: Unlinks Google identity from currently authenticated account (Phase 01-C4).
     * Fails closed if the account does not have a registered password (prevents account lockout).
     * @returns {Promise<{ success: boolean, message: string }>}
     */
    async unlinkGoogle() {
      const auth = getFirebaseAuth();
      if (!auth || !auth.currentUser) {
        throw new Error('Bạn cần đăng nhập để hủy liên kết Google.');
      }

      const idToken = await auth.currentUser.getIdToken();

      const response = await fetch(ENDPOINTS.unlinkGoogle, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg = data.error?.message || 'Không thể hủy liên kết Google. Vui lòng thử lại.';
        const err = new Error(errorMsg);
        err.code = data.error?.code || 'GOOGLE_UNLINK_FAILED';
        throw err;
      }

      // Unlink provider in client SDK if present
      try {
        if (typeof auth.currentUser.unlink === 'function') {
          await auth.currentUser.unlink('google.com');
        } else if (window.unlink) {
          await window.unlink(auth.currentUser, 'google.com');
        }
      } catch (_) {}

      // Refresh profile to reflect unlinked Google state
      await this.refreshUserProfile();

      return data;
    },

    /**
     * Requests an account recovery code via verified email (Phase 01-C5).
     * @param {Object} params
     * @param {string} params.identifier - NDID or Email
     * @returns {Promise<{ success: boolean, message: string }>}
     */
    async requestRecoveryCode({ identifier }) {
      const response = await fetch(ENDPOINTS.requestRecoveryCode, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg = data.error?.message || 'Không thể gửi mã khôi phục. Vui lòng thử lại.';
        const err = new Error(errorMsg);
        err.code = data.error?.code || 'RECOVERY_REQUEST_FAILED';
        throw err;
      }

      return data;
    },

    /**
     * Verifies the 6-digit recovery code and retrieves a one-time reset token (Phase 01-C5).
     * @param {Object} params
     * @param {string} params.identifier - NDID or Email
     * @param {string} params.code - 6-digit verification code
     * @returns {Promise<{ success: boolean, resetToken: string, message: string }>}
     */
    async verifyRecoveryCode({ identifier, code }) {
      const response = await fetch(ENDPOINTS.verifyRecoveryCode, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, code }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg = data.error?.message || 'Mã xác thực không hợp lệ.';
        const err = new Error(errorMsg);
        err.code = data.error?.code || 'VERIFICATION_FAILED';
        throw err;
      }

      return data;
    },

    /**
     * Resets account password using the verified reset token (Phase 01-C5).
     * Automatically unlocks account if it was locked.
     * @param {Object} params
     * @param {string} params.identifier - NDID or Email
     * @param {string} params.resetToken - One-time reset token from verifyRecoveryCode
     * @param {string} params.newPassword - New plaintext password
     * @returns {Promise<{ success: boolean, message: string }>}
     */
    async resetPasswordWithRecovery({ identifier, resetToken, newPassword }) {
      const response = await fetch(ENDPOINTS.resetPasswordWithRecovery, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, resetToken, newPassword }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg = data.error?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.';
        const err = new Error(errorMsg);
        err.code = data.error?.code || 'RESET_PASSWORD_FAILED';
        throw err;
      }

      return data;
    },

    // ── PHASE 01-C6: SESSION MANAGEMENT & SECURITY CENTER ───────────────────

    /**
     * Returns the current session ID for this browser tab.
     */
    getCurrentSessionId() {
      return _getCurrentSessionId();
    },

    /**
     * Returns the persistent device ID for this browser.
     */
    getCurrentDeviceId() {
      return _getCurrentDeviceId();
    },

    /**
     * Registers the current active session in the background.
     * @param {Object} [params]
     * @param {string} [params.deviceLabel]
     * @returns {Promise<Object>}
     */
    async registerCurrentSession({ deviceLabel = null } = {}) {
      const auth = getFirebaseAuth();
      if (!auth || !auth.currentUser) return null;

      const idToken = await auth.currentUser.getIdToken();
      const sessionId = _getCurrentSessionId();
      const deviceId = _getCurrentDeviceId();

      const response = await fetch(ENDPOINTS.registerSession, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          sessionId,
          deviceId,
          deviceLabel,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Không thể đăng ký phiên.');
      }
      return data.session;
    },

    /**
     * Fetches all active sessions for the current authenticated user.
     * @returns {Promise<Array<Object>>}
     */
    async getActiveSessions() {
      const auth = getFirebaseAuth();
      if (!auth || !auth.currentUser) {
        throw new Error('Bạn cần đăng nhập để xem danh sách phiên.');
      }

      const idToken = await auth.currentUser.getIdToken();
      const currentSessionId = _getCurrentSessionId();

      const response = await fetch(`${ENDPOINTS.getActiveSessions}?currentSessionId=${encodeURIComponent(currentSessionId)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Không thể tải danh sách phiên.');
      }
      return data.sessions || [];
    },

    /**
     * Revokes a specific session.
     * If the revoked session is the current tab session, signs out the user.
     * @param {string} sessionId
     * @returns {Promise<Object>}
     */
    async revokeSession(sessionId) {
      const auth = getFirebaseAuth();
      if (!auth || !auth.currentUser) {
        throw new Error('Bạn cần đăng nhập để hủy phiên.');
      }

      const idToken = await auth.currentUser.getIdToken();
      const currentSessionId = _getCurrentSessionId();

      const response = await fetch(ENDPOINTS.revokeSession, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          sessionId,
          currentSessionId,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Không thể hủy phiên đăng nhập.');
      }

      if (data.isCurrentRevoked) {
        await this.logout();
      }

      return data;
    },

    /**
     * Revokes all active sessions except the current session.
     * @returns {Promise<{ success: boolean, revokedCount: number, message: string }>}
     */
    async revokeOtherSessions() {
      const auth = getFirebaseAuth();
      if (!auth || !auth.currentUser) {
        throw new Error('Bạn cần đăng nhập để đăng xuất các thiết bị khác.');
      }

      const idToken = await auth.currentUser.getIdToken();
      const currentSessionId = _getCurrentSessionId();

      const response = await fetch(ENDPOINTS.revokeOtherSessions, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          currentSessionId,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Không thể đăng xuất các thiết bị khác.');
      }
      return data;
    },

    /**
     * Fetches all trusted devices for current authenticated user.
     * @returns {Promise<Array<Object>>}
     */
    async getTrustedDevices() {
      const auth = getFirebaseAuth();
      if (!auth || !auth.currentUser) {
        throw new Error('Bạn cần đăng nhập để xem thiết bị tin cậy.');
      }

      const idToken = await auth.currentUser.getIdToken();
      const currentDeviceId = _getCurrentDeviceId();

      const response = await fetch(`${ENDPOINTS.getTrustedDevices}?currentDeviceId=${encodeURIComponent(currentDeviceId)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Không thể tải danh sách thiết bị.');
      }
      return data.devices || [];
    },

    /**
     * Registers the current device as a trusted device.
     * @param {Object} [params]
     * @param {string} [params.deviceLabel]
     * @param {string} [params.deviceFingerprint]
     * @returns {Promise<Object>}
     */
    async registerTrustedDevice({ deviceLabel = null, deviceFingerprint = null } = {}) {
      const auth = getFirebaseAuth();
      if (!auth || !auth.currentUser) {
        throw new Error('Bạn cần đăng nhập để đăng ký thiết bị tin cậy.');
      }

      const idToken = await auth.currentUser.getIdToken();
      const deviceId = _getCurrentDeviceId();

      const response = await fetch(ENDPOINTS.registerTrustedDevice, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          deviceId,
          deviceLabel,
          deviceFingerprint,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Không thể đăng ký thiết bị tin cậy.');
      }
      return data.device;
    },

    /**
     * Revokes trust for a device.
     * @param {string} deviceId
     * @returns {Promise<Object>}
     */
    async revokeTrustedDevice(deviceId) {
      const auth = getFirebaseAuth();
      if (!auth || !auth.currentUser) {
        throw new Error('Bạn cần đăng nhập để hủy thiết bị tin cậy.');
      }

      const idToken = await auth.currentUser.getIdToken();

      const response = await fetch(ENDPOINTS.revokeTrustedDevice, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          deviceId,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Không thể hủy thiết bị tin cậy.');
      }
      return data;
    },

    /**
     * Fetches recent security activity log for the current user.
     * @param {Object} [params]
     * @param {number} [params.limit=20]
     * @returns {Promise<Array<Object>>}
     */
    async getSecurityActivity({ limit = 20 } = {}) {
      const auth = getFirebaseAuth();
      if (!auth || !auth.currentUser) {
        throw new Error('Bạn cần đăng nhập để xem nhật ký bảo mật.');
      }

      const idToken = await auth.currentUser.getIdToken();

      const response = await fetch(`${ENDPOINTS.getSecurityActivity}?limit=${encodeURIComponent(limit)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Không thể tải nhật ký bảo mật.');
      }
      return data.events || [];
    },

    // ── PHASE 01-C7: AUTHORIZATION & GOOGLE SIGN-IN ─────────────────────────

    /**
     * Authenticates via linked Google Identity (Phase 01-C7).
     * Exchanges Google credential for canonical Custom Token (preserving UID === CodeID).
     */
    async loginWithGoogle() {
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error('Hệ thống xác thực chưa sẵn sàng.');
      }

      let GoogleAuthProviderClass = window.GoogleAuthProvider;
      let signInWithPopupFn = window.signInWithPopup;

      if (!GoogleAuthProviderClass && window.firebase && window.firebase.auth) {
        GoogleAuthProviderClass = window.firebase.auth.GoogleAuthProvider;
      }
      if (!signInWithPopupFn && auth && typeof auth.signInWithPopup === 'function') {
        signInWithPopupFn = (a, p) => a.signInWithPopup(p);
      }

      if (!GoogleAuthProviderClass || !signInWithPopupFn) {
        throw new Error('Trình đăng nhập Google chưa sẵn sàng. Vui lòng tải lại trang.');
      }

      const provider = new GoogleAuthProviderClass();
      const cred = await signInWithPopupFn(auth, provider);
      const googleUser = cred.user;
      const googleSubjectId = googleUser.providerData?.[0]?.uid || googleUser.uid;
      const googleEmail = googleUser.email || null;
      const googleDisplayName = googleUser.displayName || null;

      // Delete the transient Firebase Auth user (random UID) before signing out
      try {
        await googleUser.delete();
      } catch (e) {
        // If deletion fails, ignore – we will sign out anyway
      }
      await auth.signOut();

      // Exchange with backend – first attempt without NDID
      let response = await fetch(ENDPOINTS.loginWithGoogle, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleSubjectId,
          googleEmail,
          googleDisplayName,
        }),
      });
      let data = await response.json();
      if (!response.ok || !data.success) {
        // If backend indicates provisioning needed, prompt for NDID
        if (data.needsProvisioning && data.pendingSessionId) {
          const ndid = await this._promptForNdid(); // helper to collect NDID from user
          // Provision account using pending session
          const provResp = await fetch(ENDPOINTS.loginWithGoogle, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              googleSubjectId,
              googleEmail,
              googleDisplayName,
              ndid,
              pendingSessionId: data.pendingSessionId,
            }),
          });
          const provData = await provResp.json();
          if (!provResp.ok || !provData.success) {
            const err = new Error(provData.error?.message || 'Không thể đăng nhập bằng Google.');
            err.code = provData.error?.code || 'AUTH_CREDENTIALS_INVALID';
            throw err;
          }
          data = provData;
        } else {
          const errorMsg = data.error?.message || 'Không thể đăng nhập bằng Google.';
          const err = new Error(errorMsg);
          err.code = data.error?.code || 'AUTH_CREDENTIALS_INVALID';
          throw err;
        }
      }

      // Sign in with Custom Token (UID === CodeID)
      let userCredential;
      if (typeof auth.signInWithCustomToken === 'function') {
        userCredential = await auth.signInWithCustomToken(data.customToken);
      } else if (window.signInWithCustomToken) {
        userCredential = await window.signInWithCustomToken(auth, data.customToken);
      } else {
        throw new Error('Không tìm thấy phương thức signInWithCustomToken.');
      }

      const signedInUid = userCredential.user ? userCredential.user.uid : auth.currentUser?.uid;
      if (signedInUid && signedInUid !== data.codeId) {
        await auth.signOut();
        throw new Error(`Critical Invariant Mismatch: auth.uid [${signedInUid}] !== codeId [${data.codeId}]`);
      }

      return data;
    },

    // Helper: prompt user for NDID (simple prompt modal)
    async _promptForNdid() {
      // Use a simple window.prompt for now; UI can be enhanced later
      let ndid = null;
      while (!ndid) {
        ndid = window.prompt('Vui lòng nhập NDID (chỉ chữ thường, số, dấu _ và .) để hoàn tất đăng ký Google:');
        if (ndid === null) { // user cancelled
          throw new Error('Quá trình đăng ký Google đã bị hủy bởi người dùng.');
        }
        ndid = ndid.trim();
      }
      return ndid;
    },

    /**
     * Updates user role & admin level (Owner-only operation).
     * @param {Object} params
     * @param {string} params.targetCodeId
     * @param {string} params.role
     * @param {string|null} [params.adminLevel=null]
     * @returns {Promise<Object>}
     */
    async updateUserRole({ targetCodeId, role, adminLevel = null }) {
      const auth = getFirebaseAuth();
      if (!auth || !auth.currentUser) {
        throw new Error('Bạn cần đăng nhập để thực hiện thao tác này.');
      }

      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch(ENDPOINTS.updateUserRole, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          targetCodeId,
          role,
          adminLevel,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        const errorMsg = data.error?.message || 'Không thể cập nhật quyền hạn.';
        const err = new Error(errorMsg);
        err.code = data.error?.code || 'PRIVILEGE_ESCALATION_DENIED';
        throw err;
      }
      return data;
    },

    /**
     * Admin: Retrieves paginated user list (Server-Side Pagination)
     * @param {Object} [params]
     * @param {number} [params.pageSize=20]
     * @param {string|null} [params.cursor=null]
     * @param {string|null} [params.role=null]
     * @returns {Promise<{ success: boolean, users: Array, nextCursor: string|null, hasMore: boolean }>}
     */
    async adminGetUsers({ pageSize = 20, cursor = null, role = null } = {}) {
      const auth = getFirebaseAuth();
      if (!auth || !auth.currentUser) {
        throw new Error('Bạn cần đăng nhập để thực hiện thao tác này.');
      }

      const idToken = await auth.currentUser.getIdToken();
      try {
        const response = await fetch(ENDPOINTS.adminGetUsers, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            pageSize,
            cursor,
            role,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          const errorMsg = data.error?.message || 'Không thể tải danh sách người dùng.';
          const err = new Error(errorMsg);
          err.code = data.error?.code || 'INVALID_REQUEST';
          throw err;
        }

        return data;
      } catch (fetchErr) {
        // Fallback to direct Firestore query if API server is not running locally
        if (fetchErr.name === 'TypeError' || (fetchErr.message && fetchErr.message.includes('fetch'))) {
          console.warn('[CanonicalAuth] Admin API endpoint unreachable, falling back to client Firestore query:', fetchErr.message);
          return await this._adminGetUsersDirectFirestore({ pageSize, cursor, role });
        }
        throw fetchErr;
      }
    },

    /**
     * Client-side fallback for admin user listing when local backend API server is offline.
     * Enforces safe projection (codeId, ndid, email, displayName, role, adminLevel, status, createdAt, photoURL).
     */
    async _adminGetUsersDirectFirestore({ pageSize = 20, cursor = null, role = null } = {}) {
      const db = getFirebaseFirestore();
      if (!db) throw new Error('Firestore chưa sẵn sàng.');

      try {
        let docs = [];
        if (typeof db.collection === 'function') {
          let q = db.collection('users');
          if (role) q = q.where('role', '==', role);
          q = q.orderBy('codeId').limit(pageSize + 1);
          if (cursor) q = q.startAfter(cursor);
          const snap = await q.get();
          docs = snap.docs;
        } else {
          // Modular SDK
          const { collection, getDocs, query, orderBy, limit, where, startAfter } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
          const constraints = [];
          if (role) constraints.push(where('role', '==', role));
          constraints.push(orderBy('codeId'));
          constraints.push(limit(pageSize + 1));
          if (cursor) constraints.push(startAfter(cursor));
          const q = query(collection(db, 'users'), ...constraints);
          const snap = await getDocs(q);
          docs = snap.docs;
        }

        const hasMore = docs.length > pageSize;
        const resultDocs = hasMore ? docs.slice(0, pageSize) : docs;
        const nextCursor = hasMore ? resultDocs[resultDocs.length - 1].id : null;

        const users = resultDocs.map(doc => {
          const d = doc.data() || {};
          return {
            codeId: d.codeId || doc.id,
            ndid: d.ndid || null,
            email: d.email || null,
            displayName: d.displayName || d.name || null,
            role: d.role || 'user',
            adminLevel: d.adminLevel || null,
            status: d.status || 'active',
            createdAt: d.createdAt ? (d.createdAt.toMillis ? d.createdAt.toMillis() : d.createdAt) : null,
            photoURL: d.photoURL || null,
          };
        });

        return {
          success: true,
          users,
          nextCursor,
          hasMore,
        };
      } catch (err) {
        console.error('[CanonicalAuth] Fallback direct Firestore users query failed:', err);
        throw new Error('Không thể tải danh sách người dùng: ' + err.message);
      }
    },

    /**
     * Checks if current user has active admin role.
     * @returns {boolean}
     */
    isAdmin() {
      return _currentUserProfile?.role === 'admin' && _currentUserProfile?.status === 'active';
    },

    /**
     * Checks if current user is active system owner.
     * @returns {boolean}
     */
    isOwner() {
      return this.isAdmin() && _currentUserProfile?.adminLevel === 'owner';
    },

    /**
     * Route protection helper: redirects to login if unauthenticated.
     * @param {string} [redirectUrl='/auth/login/']
     */
    requireAuth(redirectUrl = '/auth/login/') {
      const checkAndRedirect = ({ state }) => {
        if (state === 'unauthenticated') {
          const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `${redirectUrl}?redirect=${currentUrl}`;
        }
      };

      if (_currentAuthState !== 'loading') {
        checkAndRedirect({ state: _currentAuthState });
      } else {
        const unsub = this.onAuthStateChanged((authData) => {
          if (authData.state !== 'loading') {
            unsub();
            checkAndRedirect(authData);
          }
        });
      }
    },

    /**
     * Route guard UX helper: Requires user to have specified role or adminLevel.
     * Note: Purely a UX convenience layer. Server-side Firestore Rules & Cloud Functions
     * are the authoritative security boundaries.
     * @param {string} role - 'admin' | 'user'
     * @param {string|null} [adminLevel=null] - 'owner' | 'admin' | null
     * @param {string} [redirectUrl='/']
     */
    requireRole(role, adminLevel = null, redirectUrl = '/') {
      const checkAndRedirect = ({ state, profile }) => {
        if (state === 'unauthenticated') {
          const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/auth/login/?redirect=${currentUrl}`;
          return;
        }
        if (state === 'authenticated') {
          if (role && profile?.role !== role) {
            window.location.href = redirectUrl;
            return;
          }
          if (adminLevel && profile?.adminLevel !== adminLevel) {
            window.location.href = redirectUrl;
            return;
          }
        }
      };

      if (_currentAuthState !== 'loading') {
        checkAndRedirect({ state: _currentAuthState, profile: _currentUserProfile });
      } else {
        const unsub = this.onAuthStateChanged((authData) => {
          if (authData.state !== 'loading') {
            unsub();
            checkAndRedirect(authData);
          }
        });
      }
    },

    /**
     * Route guard UX helper: Requires Admin role.
     * @param {string} [redirectUrl='/']
     */
    requireAdmin(redirectUrl = '/') {
      this.requireRole('admin', null, redirectUrl);
    },

    /**
     * Route guard UX helper: Requires System Owner.
     * @param {string} [redirectUrl='/']
     */
    requireOwner(redirectUrl = '/') {
      this.requireRole('admin', 'owner', redirectUrl);
    },

    /**
     * Requests or resends an account email verification email.
     * @param {Object} [params]
     * @param {string} [params.email] - Optional target email override
     * @returns {Promise<{ success: boolean, message: string }>}
     */
    async sendVerificationEmail(params = {}) {
      const idToken = await this.getIdToken(true);
      if (!idToken) {
        throw { code: 'UNAUTHORIZED', message: 'Yêu cầu phiên đăng nhập hợp lệ để gửi email xác thực.' };
      }

      const response = await fetch(ENDPOINTS.sendVerificationEmail, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        const err = data.error || { code: 'VERIFICATION_FAILED', message: data.message || 'Không thể gửi email xác thực.' };
        throw err;
      }

      return data;
    },

    /**
     * Validates an email verification token received via verification link.
     * @param {string} token
     * @returns {Promise<{ success: boolean, codeId: string, email: string, message: string }>}
     */
    async verifyEmail(token) {
      if (!token || typeof token !== 'string') {
        throw { code: 'INVALID_ARGUMENT', message: 'Mã xác thực email không hợp lệ.' };
      }

      const response = await fetch(ENDPOINTS.verifyEmail, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        const err = data.error || { code: 'VERIFICATION_FAILED', message: data.message || 'Xác thực email thất bại hoặc mã đã hết hạn.' };
        throw err;
      }

      // If current logged-in user matches verified codeId, refresh their profile
      if (_currentCodeId === data.codeId && _currentUserProfile) {
        _currentUserProfile.emailVerified = true;
        _notifyListeners();
      }

      return data;
    },

    /**
     * Safe UI error mapper
     * @param {any} err
     * @returns {string}
     */
    mapError(err) {
      if (!err) return 'Đã xảy ra lỗi không xác định.';
      const code = err.code || '';
      const msg = err.message || '';

      switch (code) {
        case 'AUTH_CREDENTIALS_INVALID':
          return 'Tài khoản hoặc mật khẩu không chính xác.';
        case 'GOOGLE_NOT_LINKED':
          return msg || 'Tài khoản Google này chưa được liên kết với NDID nào. Vui lòng đăng nhập bằng NDID và mật khẩu, sau đó liên kết trong Cài đặt.';
        case 'ACCOUNT_LOCKED':
          return 'Tài khoản đã bị khóa do đăng nhập sai nhiều lần. Vui lòng khôi phục hoặc liên hệ quản trị viên.';
        case 'ACCOUNT_DISABLED':
          return 'Tài khoản này đã bị vô hiệu hóa.';
        case 'ACCOUNT_BANNED':
          return 'Tài khoản đang bị tạm khóa.';
        case 'FORBIDDEN':
          return 'Bạn không có quyền thực hiện thao tác này.';
        case 'PRIVILEGE_ESCALATION_DENIED':
          return 'Thao tác nâng quyền hoặc thay đổi quyền hạn không được phép.';
        case 'IDENTIFIER_UNAVAILABLE':
          return 'Tên tài khoản hoặc email này đã được sử dụng. Vui lòng chọn tên khác.';
        case 'EMAIL_ALREADY_VERIFIED':
          return 'Địa chỉ email này đã được xác thực trước đó.';
        case 'VERIFICATION_TOKEN_EXPIRED':
          return 'Mã xác thực email đã hết hạn. Vui lòng gửi lại email xác nhận mới.';
        case 'INVALID_VERIFICATION_TOKEN':
          return 'Mã xác thực email không hợp lệ hoặc đã được sử dụng.';
        case 'GOOGLE_IDENTITY_ALREADY_LINKED':
        case 'auth/credential-already-in-use':
          return 'Tài khoản Google này đã được liên kết với một tài khoản khác.';
        case 'auth/popup-closed-by-user':
          return 'Đã đóng cửa sổ đăng nhập Google trước khi hoàn tất.';
        case 'auth/popup-blocked':
          return 'Trình duyệt đã chặn cửa sổ đăng nhập. Vui lòng cho phép popup và thử lại.';
        case 'auth/cancelled-popup-request':
          return 'Yêu cầu đăng nhập Google đã bị hủy.';
        case 'auth/account-exists-with-different-credential':
          return 'Email Google này đã được dùng với phương thức đăng nhập khác.';
        case 'RATE_LIMIT_EXCEEDED':
          return 'Bạn đang gửi yêu cầu quá nhanh. Vui lòng chờ 60 giây rồi thử lại.';
        case 'SESSION_REVOKED':
          return 'Phiên đăng nhập đã bị hủy.';
        case 'DEVICE_REVOKED':
          return 'Thiết bị đã bị hủy khỏi danh sách tin cậy.';
        case 'VALIDATION_ERROR':
          return msg || 'Thông tin nhập vào không hợp lệ.';
        case 'UNAUTHORIZED':
          return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        default:
          if (msg.includes('network') || msg.includes('Failed to fetch')) {
            return 'Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối mạng.';
          }
          return msg || 'Đã xảy ra sự cố. Vui lòng thử lại sau.';
      }
    },
  };

  // Export globally
  window.canonicalAuth = canonicalAuth;

})(window);
