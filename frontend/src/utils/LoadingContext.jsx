import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);

  const startLoading = useCallback(() => {
    setLoadingCount((c) => c + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingCount((c) => Math.max(0, c - 1));
  }, []);

  const isLoading = loadingCount > 0;

  const value = useMemo(() => ({ isLoading, startLoading, stopLoading }), [isLoading, startLoading, stopLoading]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
