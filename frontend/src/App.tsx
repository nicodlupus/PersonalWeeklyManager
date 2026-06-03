import React from 'react';
import { useAuth } from './store/auth';
import LoginPage from './pages/LoginPage';
import AppShell from './pages/AppShell';

export default function App() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AppShell /> : <LoginPage />;
}
