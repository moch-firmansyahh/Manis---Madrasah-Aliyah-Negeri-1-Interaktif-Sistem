import { createContext, useContext, useState, useEffect } from 'react';

const GuruClassContext = createContext(null);

export function GuruClassProvider({ children }) {
  const [selectedClass, setSelectedClass] = useState(() => {
    try {
      const stored = localStorage.getItem('guruSelectedClass');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [previousClass, setPreviousClass] = useState(null);

  useEffect(() => {
    if (selectedClass) {
      localStorage.setItem('guruSelectedClass', JSON.stringify(selectedClass));
    } else {
      localStorage.removeItem('guruSelectedClass');
    }
  }, [selectedClass]);

  const selectClass = (cls) => {
    setPreviousClass(cls);
    setSelectedClass(cls);
  };

  const clearClass = () => {
    setPreviousClass(selectedClass);
    setSelectedClass(null);
  };

  const restoreClass = () => {
    if (previousClass) {
      setSelectedClass(previousClass);
    }
  };

  return (
    <GuruClassContext.Provider value={{ selectedClass, selectClass, clearClass, previousClass, restoreClass }}>
      {children}
    </GuruClassContext.Provider>
  );
}

export function useGuruClass() {
  const ctx = useContext(GuruClassContext);
  if (!ctx) throw new Error('useGuruClass must be used within GuruClassProvider');
  return ctx;
}
