import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardActionArea,
  Typography,
  Box,
  Icon,
  Chip
} from '@mui/material';
import { 
  ArrowForward as ArrowForwardIcon,
  Hotel as HotelIcon,
  EventNote as EventNoteIcon,
  People as PeopleIcon,
  Payments as PaymentsIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  LocalOffer as LocalOfferIcon,
  CalendarToday as CalendarTodayIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

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
  
  // Xử lý icon - có thể là string hoặc component React
  const renderIcon = () => {
    // Để theo dõi style chung cho icon
    const iconStyle = { 
      color: isHovered ? 'white' : color, 
      fontSize: 28,
      transition: 'all 0.3s ease'
    };
    
    // Nếu icon là React element, trả về nguyên icon
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, { sx: iconStyle });
    }
    
    // Nếu icon là string, map sang component tương ứng
    switch (icon) {
      case 'hotel':
        return <HotelIcon sx={iconStyle} />;
      case 'event_note':
        return <EventNoteIcon sx={iconStyle} />;
      case 'people':
        return <PeopleIcon sx={iconStyle} />;
      case 'payments':
        return <PaymentsIcon sx={iconStyle} />;
      case 'settings':
        return <SettingsIcon sx={iconStyle} />;
      case 'assessment':
        return <AssessmentIcon sx={iconStyle} />;
      case 'local_offer':
        return <LocalOfferIcon sx={iconStyle} />;
      case 'calendar_today':
        return <CalendarTodayIcon sx={iconStyle} />;
      case 'assignment':
        return <AssignmentIcon sx={iconStyle} />;
      default:
        // Fallback sử dụng Material UI Icon font
        return <Icon sx={iconStyle}>{icon}</Icon>;
    }
  };

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
            {renderIcon()}
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