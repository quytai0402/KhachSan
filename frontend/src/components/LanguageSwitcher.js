import React from 'react';
import { Button, ButtonGroup, Tooltip } from '@mui/material';
import { Translate as TranslateIcon } from '@mui/icons-material';
import { useLanguage } from '../context/LanguageContext';

/**
 * Component cho phép người dùng chuyển đổi ngôn ngữ
 * @returns {React.Component}
 */
const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <Tooltip title="Chọn ngôn ngữ" arrow placement="bottom">
      <ButtonGroup variant="outlined" size="small" aria-label="language selector">
        <Button 
          startIcon={<TranslateIcon />}
          onClick={() => changeLanguage('vi')}
          variant={language === 'vi' ? 'contained' : 'outlined'}
          color={language === 'vi' ? 'primary' : 'inherit'}
          size="small"
        >
          VI
        </Button>
        <Button 
          onClick={() => changeLanguage('en')}
          variant={language === 'en' ? 'contained' : 'outlined'}
          color={language === 'en' ? 'primary' : 'inherit'}
          size="small"
        >
          EN
        </Button>
      </ButtonGroup>
    </Tooltip>
  );
};

export default LanguageSwitcher;
