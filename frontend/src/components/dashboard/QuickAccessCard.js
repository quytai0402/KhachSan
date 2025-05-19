import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardActionArea,
  Typography,
  Box,
  Icon,
  Chip,
  Avatar
} from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';

/**
 * Card hiển thị menu truy cập nhanh
 * 
 * @param {Object} props - Props component
 * @param {string} props.title - Tiêu đề menu
 * @param {string} props.description - Mô tả chức năng
 * @param {string} props.icon - Tên icon (Material Icons)
 * @param {string} props.path - Đường dẫn đến trang
 * @param {string} props.color - Màu sắc (có thể bỏ qua)
 * @param {string} props.badge - Text hiển thị trên badge (tuỳ chọn)
 * @param {number} props.count - Số lượng để hiển thị (tuỳ chọn)
 */
const QuickAccessCard = ({ 
  title, 
  description, 
  icon, 
  path, 
  color = '#1e4e8c',
  badge,
  count
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.05)',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
        borderRadius: '12px',
        position: 'relative',
        overflow: 'hidden',
        border: isHovered ? `1px solid ${color}40` : '1px solid transparent',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardActionArea 
        onClick={() => navigate(path)}
        sx={{ 
          p: 2.5,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          position: 'relative',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: isHovered ? `linear-gradient(135deg, ${color}05 0%, ${color}15 100%)` : 'transparent',
            transition: 'all 0.3s ease',
            pointerEvents: 'none',
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 2 }}>
          <Box 
            sx={{ 
              bgcolor: isHovered ? color : `${color}20`, 
              borderRadius: '12px', 
              width: 52, 
              height: 52, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              transition: 'all 0.3s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <Icon sx={{ 
              color: isHovered ? 'white' : color, 
              fontSize: 28,
              transition: 'all 0.3s ease',
            }}>
              {icon}
            </Icon>
          </Box>
          
          {count !== undefined && (
            <Chip
              label={count}
              sx={{
                bgcolor: isHovered ? color : `${color}20`,
                color: isHovered ? 'white' : color,
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
              }}
              size="small"
            />
          )}
          
          {badge && (
            <Chip
              label={badge}
              size="small"
              sx={{
                bgcolor: isHovered ? color : `${color}15`,
                color: isHovered ? 'white' : color,
                fontWeight: 500,
                fontSize: '0.7rem',
                transition: 'all 0.3s ease',
              }}
            />
          )}
        </Box>
        
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            fontWeight: 600, 
            alignSelf: 'flex-start',
            fontSize: '1.1rem',
            mb: 1,
            color: isHovered ? color : 'text.primary',
            transition: 'color 0.3s ease',
          }}
        >
          {title}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            alignSelf: 'flex-start',
            mb: 2
          }}
        >
          {description}
        </Typography>
        
        <Box 
          sx={{ 
            mt: 'auto', 
            display: 'flex',
            alignItems: 'center',
            color: color,
            fontWeight: 500,
            fontSize: '0.875rem',
            opacity: isHovered ? 1 : 0.7,
            transition: 'all 0.3s ease',
            '& .MuiSvgIcon-root': {
              transition: 'transform 0.3s ease',
              transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
              fontSize: '1rem',
              ml: 0.5
            }
          }}
        >
          Truy cập <ArrowForwardIcon />
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default QuickAccessCard;