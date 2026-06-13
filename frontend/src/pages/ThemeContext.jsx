import React, { createContext, useContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  const [accentColor, setAccentColor] = useState(localStorage.getItem('accent') || 'blue');
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || 'normal');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('accent', accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
    const sizes = { small: '14px', normal: '16px', large: '18px' };
    document.documentElement.style.fontSize = sizes[fontSize] || '16px';
  }, [fontSize]);

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      toggleTheme: () => setIsDarkMode(p => !p),
      accentColor,
      setAccentColor,
      fontSize,
      setFontSize,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);