const fs = require('fs');
const path = require('path');

// Đường dẫn đến các trang admin và staff
const adminDir = path.join(__dirname, '..', 'src', 'pages', 'admin');
const staffDir = path.join(__dirname, '..', 'src', 'pages', 'staff');

// Hàm để cập nhật một trang
function updatePageWithLayout(filePath, pageTitle) {
  console.log(`Processing ${filePath}...`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Thêm import withDashboardLayout
    let updatedContent = content;
    
    if (!content.includes('withDashboardLayout')) {
      // Tìm dòng import cuối cùng
      const lastImportIndex = content.lastIndexOf('import');
      const lastImportEndIndex = content.indexOf(';', lastImportIndex) + 1;
      
      updatedContent = content.slice(0, lastImportEndIndex) + 
        "\nimport { withDashboardLayout } from '../../utils/layoutHelpers';" + 
        content.slice(lastImportEndIndex);
    }
    
    // Loại bỏ import Container nếu không dùng nữa
    if (updatedContent.includes("Container,")) {
      updatedContent = updatedContent.replace("Container,", "");
    }
    
    // Tìm và thay đổi export default
    const exportDefaultPattern = /export default ([^;]+);/;
    const match = updatedContent.match(exportDefaultPattern);
    
    if (match && !updatedContent.includes('withDashboardLayout')) {
      const componentName = match[1];
      updatedContent = updatedContent.replace(
        exportDefaultPattern,
        `export default withDashboardLayout(${componentName}, "${pageTitle}");`
      );
      
      // Thay thế Container bằng Box
      updatedContent = updatedContent.replace(
        /<Container[^>]*>/g, 
        '<Box sx={{ flexGrow: 1, pb: 3 }}>'
      );
      
      updatedContent = updatedContent.replace(
        /<\/Container>/g, 
        '</Box>'
      );
      
      // Lưu tệp đã cập nhật
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath} successfully!`);
      return true;
    } else {
      console.log(`⚠️ No changes needed for ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Cập nhật các trang admin
const adminPages = [
  { file: 'Bookings.js', title: 'Quản Lý Đặt Phòng' },
  { file: 'Services.js', title: 'Quản Lý Dịch Vụ' },
  { file: 'Promotions.js', title: 'Quản Lý Khuyến Mãi' },
  { file: 'Reports.js', title: 'Báo Cáo' }
];

// Cập nhật các trang staff
const staffPages = [
  { file: 'Bookings.js', title: 'Quản Lý Đặt Phòng' },
  { file: 'Rooms.js', title: 'Quản Lý Phòng' },
  { file: 'Guests.js', title: 'Quản Lý Khách Hàng' },
  { file: 'Schedule.js', title: 'Lịch Trình' }
];

console.log('Starting to update admin pages...');
// Xử lý các trang admin
let adminUpdated = 0;
adminPages.forEach(page => {
  const filePath = path.join(adminDir, page.file);
  if (fs.existsSync(filePath)) {
    if (updatePageWithLayout(filePath, page.title)) {
      adminUpdated++;
    }
  } else {
    console.log(`❌ File not found: ${filePath}`);
  }
});

console.log('\nStarting to update staff pages...');
// Xử lý các trang staff
let staffUpdated = 0;
staffPages.forEach(page => {
  const filePath = path.join(staffDir, page.file);
  if (fs.existsSync(filePath)) {
    if (updatePageWithLayout(filePath, page.title)) {
      staffUpdated++;
    }
  } else {
    console.log(`❌ File not found: ${filePath}`);
  }
});

console.log(`\n✅ Script completed! Updated ${adminUpdated} admin pages and ${staffUpdated} staff pages.`); 