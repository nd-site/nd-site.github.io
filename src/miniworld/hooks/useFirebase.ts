import { useState, useEffect } from 'react';

declare global {
  interface Window {
    firebaseApp?: any;
    firebaseAuth?: any;
    firebaseDb?: any;
    firebaseFirestore?: any;
  }
}

export function useFirebase() {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Read cached user session from localStorage
    try {
      const raw = localStorage.getItem('nd_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        setSessionUser(parsed);
        if (parsed.role === 'admin') {
          setIsAdmin(true);
        }
      }
    } catch (_) {}

    const checkFirebase = () => {
      if (window.firebaseApp && window.firebaseAuth && window.firebaseDb) {
        setIsReady(true);
        window.firebaseAuth.onAuthStateChanged((u: any) => {
          setUser(u);
        });
      }
    };

    if (window.firebaseApp) {
      checkFirebase();
    } else {
      window.addEventListener('firebase-ready', checkFirebase, { once: true });
    }

    return () => {
      window.removeEventListener('firebase-ready', checkFirebase);
    };
  }, []);

  return { 
    isReady, 
    user,
    sessionUser,
    isAdmin,
    db: window.firebaseDb, 
    auth: window.firebaseAuth,
    firestore: window.firebaseFirestore
  };
}
