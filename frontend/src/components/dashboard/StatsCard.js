import React, { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Divider,
  Icon,
  LinearProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import { TrendingUp, TrendingDown, InfoOutlined } from '@mui/icons-material';

/**
 * Thẻ hiển thị thống kê thông tin sử dụng cho cả Admin và Staff
 * @param {Object} props - Props của component
 * @param {string} props.title - Tiêu đề của thẻ
 * @param {string} props.icon - Icon name (Material Icons)
 * @param {number|string} props.mainStat - Số liệu chính
 * @param {Array<Object>} props.subStats - Mảng các thống kê phụ
 * @param {string} props.color - Màu chủ đạo của thẻ
 * @param {string} props.linkText - Nội dung đường link (optional)
 * @param {string} props.linkUrl - URL đường link (optional)
 * @param {number} props.trend - Phần trăm tăng/giảm (optional)
 * @param {string} props.description - Mô tả thêm về thông số (optional)
 */
const StatsCard = ({ 
  title, 
  icon, 
  mainStat, 
  subStats = [], 
  color = '#1e4e8c',
  linkText, 
  linkUrl,
  trend = null,
  description = ''
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  const handleNavigate = () => {
    if (linkUrl) {
      navigate(linkUrl);
    }
  };

  // Calculate total for progress bars (if applicable)
  const calculateTotal = () => {
    if (!subStats || subStats.length === 0) return 0;
    return subStats.reduce((acc, curr) => {
      const value = typeof curr.value === 'number' ? curr.value : 0;
      return acc + value;
    }, 0);
  };
  
  const total = calculateTotal();
  
  const renderTrendIndicator = () => {
    if (trend === null) return null;
    
    const isPositive = trend >= 0;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, color: isPositive ? '#2e7d32' : '#d32f2f' }}>
        {isPositive ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
        <Typography variant="body2" component="span" sx={{ ml: 0.5, fontWeight: 500 }}>
          {Math.abs(trend)}%
        </Typography>
      </Box>
    );
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.08)',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
        borderRadius: '12px',
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(180deg, white, white, ${color}05)`,
        borderTop: `4px solid ${color}`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Color accent on top */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: '4px',
          background: `linear-gradient(90deg, ${color}, ${color}99)`,
          zIndex: 1
        }} 
      />
      
      <CardContent sx={{ flexGrow: 1, p: 3, pt: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" component="h2" fontWeight="600" sx={{ fontSize: '1.1rem' }}>
              {title}
            </Typography>
            {description && (
              <Tooltip title={description} arrow placement="top">
                <IconButton size="small" sx={{ ml: 0.5, p: 0.25 }}>
                  <InfoOutlined sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <Box 
            sx={{ 
              bgcolor: `${color}20`, 
              borderRadius: '50%', 
              width: 48, 
              height: 48, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              transition: 'all 0.3s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <Icon sx={{ color: color, fontSize: 28 }}>{icon}</Icon>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '1.6rem', sm: '2rem' },
              transition: 'all 0.3s ease',
              color: isHovered ? color : 'inherit'
            }}
          >
            {mainStat}
          </Typography>
          {renderTrendIndicator()}
        </Box>
        
        {subStats && subStats.length > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            
            <Box sx={{ mt: 1.5 }}>
              {subStats.map((stat, index) => (
                <Box key={index} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      {stat.value}
                    </Typography>
                  </Box>
                  {typeof stat.value === 'number' && total > 0 && (
                    <LinearProgress
                      variant="determinate"
                      value={(stat.value / total) * 100}
                      sx={{
                        height: 6,
                        borderRadius: 1,
                        bgcolor: `${color}15`,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: color,
                        }
                      }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          </>
        )}
      </CardContent>
      
      {linkText && linkUrl && (
        <Box sx={{ p: 2, pt: 0 }}>
          <Button 
            fullWidth 
            variant="text" 
            size="small"
            onClick={handleNavigate}
            sx={{ 
              color,
              fontWeight: 500,
              '&:hover': {
                backgroundColor: `${color}15`,
              }
            }}
          >
            {linkText}
          </Button>
        </Box>
      )}
    </Card>
  );
};

// Memoize component để tránh re-render không cần thiết
export default memo(StatsCard);