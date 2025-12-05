// src/components/AppInitializer.jsx
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDonors } from '../context/DonorContext';

const AppInitializer = ({ children }) => {
  const { initialize: initializeAuth } = useAuth();
  const { initialize: initializeDonors } = useDonors();

  useEffect(() => {
    const init = async () => {
      await initializeAuth();
      await initializeDonors();
    };
    init();
  }, [initializeAuth, initializeDonors]);

  return children;
};

export default AppInitializer;
