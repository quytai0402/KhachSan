import React from 'react';
import { Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useLanguage } from '../context/LanguageContext';

/**
 * Component bọc các thành phần MUI để hỗ trợ đa ngôn ngữ
 * Các component này tự động dịch nội dung dựa vào ngôn ngữ hiện tại
 */

// Typography với hỗ trợ đa ngôn ngữ
export const Text = ({ children, translateParams = {}, ...props }) => {
  const { t } = useLanguage();
  return <Typography {...props}>{typeof children === 'string' ? t(children, translateParams) : children}</Typography>;
};

// Button với hỗ trợ đa ngôn ngữ
export const TranslatedButton = ({ children, translateParams = {}, ...props }) => {
  const { t } = useLanguage();
  return <Button {...props}>{typeof children === 'string' ? t(children, translateParams) : children}</Button>;
};

// TextField với hỗ trợ đa ngôn ngữ cho label và helperText
export const TranslatedTextField = ({ label, helperText, ...props }) => {
  const { t } = useLanguage();
  return (
    <TextField
      label={label ? t(label) : undefined}
      helperText={helperText ? t(helperText) : undefined}
      {...props}
    />
  );
};

// Dialog components với hỗ trợ đa ngôn ngữ
export const TranslatedDialog = ({ children, ...props }) => {
  return <Dialog {...props}>{children}</Dialog>;
};

export const TranslatedDialogTitle = ({ children, ...props }) => {
  const { t } = useLanguage();
  return <DialogTitle {...props}>{typeof children === 'string' ? t(children) : children}</DialogTitle>;
};

export const TranslatedDialogContent = ({ children, ...props }) => {
  return <DialogContent {...props}>{children}</DialogContent>;
};

export const TranslatedDialogActions = ({ children, ...props }) => {
  return <DialogActions {...props}>{children}</DialogActions>;
};

export default {
  Text,
  TranslatedButton,
  TranslatedTextField,
  TranslatedDialog,
  TranslatedDialogTitle,
  TranslatedDialogContent,
  TranslatedDialogActions
};
