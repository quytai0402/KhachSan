import React, { createContext, useContext, useState } from 'react';
import { translate } from '../utils/i18n';

// Tạo ngữ cảnh ngôn ngữ
const LanguageContext = createContext();

/**
 * Provider cho ngữ cảnh ngôn ngữ
 * @param {Object} props 
 * @returns {React.Component}
 */
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('vi'); // Mặc định là tiếng Việt

  // Hàm chuyển đổi ngôn ngữ
  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  // Hàm dịch văn bản
  const t = (text, params = {}) => {
    if (language === 'vi') {
      return translate(text, params);
    }
    return text; // Mặc định trả về tiếng Anh
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Hook để sử dụng ngữ cảnh ngôn ngữ
 * @returns {Object} Ngữ cảnh ngôn ngữ
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage phải được sử dụng trong LanguageProvider');
  }
  return context;
};

export default LanguageContext;
