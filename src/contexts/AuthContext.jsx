// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

const AuthContext = createContext();

const poolData = {
  UserPoolId: process.env.REACT_APP_USER_POOL_ID || 'us-east-2_lk1vd8Mwx',
  ClientId: process.env.REACT_APP_CLIENT_ID || '47bl8bnnokh7p1i4j7ha6f6ala'
};

const userPool = new CognitoUserPool(poolData);

const getRoleFromToken = (session) => {
  try {
    const idToken = session.getIdToken().getJwtToken();
    const payload = JSON.parse(atob(idToken.split('.')[1]));
    const groups = payload['cognito:groups'] || [];
    if (groups.some(g => g.toLowerCase() === 'admins' || g.toLowerCase() === 'admin')) {
      return 'admin';
    }
    if (payload['custom:role']) return payload['custom:role'];
    return 'ra';
  } catch (error) {
    console.error('AuthProvider: Error parsing token:', error);
    return 'ra';
  }
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    userRole: null,
    loading: true,
    requiresPasswordChange: false,
    pendingCognitoUser: null,
    pendingUserAttributes: null
  });

  useEffect(() => {
    const currentUser = userPool.getCurrentUser();

    if (currentUser) {
      currentUser.getSession((err, session) => {
        if (err || !session.isValid()) {
          setAuth({
            isAuthenticated: false, user: null, userRole: null, loading: false,
            requiresPasswordChange: false, pendingCognitoUser: null, pendingUserAttributes: null
          });
          return;
        }

        const userRole = getRoleFromToken(session);
        currentUser.getUserAttributes((err, attributes) => {
          const userData = {
            username: currentUser.getUsername(),
            id_token: session.getIdToken().getJwtToken(),
            access_token: session.getAccessToken().getJwtToken(),
            refresh_token: session.getRefreshToken().getToken(),
            attributes: attributes ? attributes.reduce((acc, attr) => {
              acc[attr.Name] = attr.Value;
              return acc;
            }, {}) : {}
          };
          setAuth({
            isAuthenticated: true, user: userData, userRole, loading: false,
            requiresPasswordChange: false, pendingCognitoUser: null, pendingUserAttributes: null
          });
        });
      });
    } else {
      setAuth({
        isAuthenticated: false, user: null, userRole: null, loading: false,
        requiresPasswordChange: false, pendingCognitoUser: null, pendingUserAttributes: null
      });
    }
  }, []);

  const login = async (email, password) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
      const authDetails = new AuthenticationDetails({ Username: email, Password: password });

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (session) => {
          const userRole = getRoleFromToken(session);
          cognitoUser.getUserAttributes((err, attributes) => {
            const userData = {
              username: cognitoUser.getUsername(),
              id_token: session.getIdToken().getJwtToken(),
              access_token: session.getAccessToken().getJwtToken(),
              refresh_token: session.getRefreshToken().getToken(),
              attributes: attributes ? attributes.reduce((acc, attr) => {
                acc[attr.Name] = attr.Value;
                return acc;
              }, {}) : {}
            };
            setAuth({
              isAuthenticated: true, user: userData, userRole, loading: false,
              requiresPasswordChange: false, pendingCognitoUser: null, pendingUserAttributes: null
            });
            resolve({ user: userData, role: userRole });
          });
        },

        onFailure: (err) => {
          console.error('AuthProvider: Login failed:', err);
          reject(err);
        },

       
        newPasswordRequired: (userAttributes) => {
          console.log('AuthProvider: New password required');
          setAuth(prev => ({
            ...prev,
            requiresPasswordChange: true,
            pendingCognitoUser: cognitoUser,
            pendingUserAttributes: userAttributes,
            loading: false
          }));
          resolve({ requiresPasswordChange: true });
        }
      });
    });
  };

  
  const completePasswordChange = async (newPassword) => {
    return new Promise((resolve, reject) => {
      const { pendingCognitoUser, pendingUserAttributes } = auth;

      if (!pendingCognitoUser) {
        reject(new Error('No pending session. Please sign in again.'));
        return;
      }

      
      const cleanAttributes = { ...pendingUserAttributes };
      delete cleanAttributes.email_verified;
      delete cleanAttributes.email;
      delete cleanAttributes.phone_number_verified;

      pendingCognitoUser.completeNewPasswordChallenge(newPassword, cleanAttributes, {
        onSuccess: (session) => {
          console.log('AuthProvider: Password change successful');
          const userRole = getRoleFromToken(session);

          pendingCognitoUser.getUserAttributes((err, attributes) => {
            const userData = {
              username: pendingCognitoUser.getUsername(),
              id_token: session.getIdToken().getJwtToken(),
              access_token: session.getAccessToken().getJwtToken(),
              refresh_token: session.getRefreshToken().getToken(),
              attributes: attributes ? attributes.reduce((acc, attr) => {
                acc[attr.Name] = attr.Value;
                return acc;
              }, {}) : {}
            };
            setAuth({
              isAuthenticated: true, user: userData, userRole, loading: false,
              requiresPasswordChange: false, pendingCognitoUser: null, pendingUserAttributes: null
            });
            resolve({ user: userData, role: userRole });
          });
        },
        onFailure: (err) => {
          console.error('AuthProvider: Password change failed:', err);
          reject(err);
        }
      });
    });
  };

  const logout = () => {
    const currentUser = userPool.getCurrentUser();
    if (currentUser) currentUser.signOut();
    setAuth({
      isAuthenticated: false, user: null, userRole: null, loading: false,
      requiresPasswordChange: false, pendingCognitoUser: null, pendingUserAttributes: null
    });
  };

  const refreshSession = async () => {
    return new Promise((resolve, reject) => {
      const currentUser = userPool.getCurrentUser();
      if (!currentUser) { reject(new Error('No current user')); return; }

      currentUser.getSession((err, session) => {
        if (err || !session.isValid()) { reject(new Error('Session invalid')); return; }

        currentUser.refreshSession(session.getRefreshToken(), (err, newSession) => {
          if (err) { reject(err); return; }
          setAuth(prev => ({
            ...prev,
            user: {
              ...prev.user,
              id_token: newSession.getIdToken().getJwtToken(),
              access_token: newSession.getAccessToken().getJwtToken()
            }
          }));
          resolve(newSession);
        });
      });
    });
  };

  return (
    <AuthContext.Provider value={{
      ...auth,
      login,
      logout,
      refreshSession,
      completePasswordChange
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export default AuthContext;