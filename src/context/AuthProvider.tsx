//File: bluehouz_frontend\src\context\AuthProvider.tsx

'use client';

import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSnackbar } from './SnackbarContext';

type Contact = {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  [key: string]: any;
};

type User = {
  id: string;
  email: string;
  contact?: Contact;
  [key: string]: any;
};

type AuthContextType<TData = any> = {
  user: User | null;
  isAuthenticated: boolean;
  fetchEntityLoading: boolean;
  fetchEntityMeLoading: boolean;
  rowPendingDelete: TData | null;
  setRowPendingDelete: React.Dispatch<React.SetStateAction<TData | null>>;
  setFetchEntityLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setFetchEntityMeLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: (user: User | null) => void;
};


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showSnackbar } = useSnackbar()
  const [user, setUser] = useState<User | null>(null);
  const [fetchEntityLoading, setFetchEntityLoading] = useState<boolean>(false);
  const [fetchEntityMeLoading, setFetchEntityMeLoading] = useState<boolean>(true);
  const [rowPendingDelete, setRowPendingDelete] = React.useState<TData | null>(null);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          withCredentials: true,
        });

        setUser(res.data.user);
      } catch (err) {
        setUser(null);
        showSnackbar("Unauthorized User!", 'error')
      } finally {
        setFetchEntityMeLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      fetchEntityLoading,
      fetchEntityMeLoading,
      rowPendingDelete,
      setRowPendingDelete,
      setFetchEntityMeLoading,
      setFetchEntityLoading,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
