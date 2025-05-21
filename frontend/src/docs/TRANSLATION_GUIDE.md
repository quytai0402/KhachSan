# Hệ thống đa ngôn ngữ cho Khách Sạn Sang Trọng

Hệ thống đa ngôn ngữ này cung cấp khả năng chuyển đổi giữa Tiếng Việt và Tiếng Anh trong ứng dụng.

## Cách sử dụng

### 1. Thêm chuỗi mới vào từ điển

Mở file `/src/utils/i18n.js` và thêm các chuỗi mới vào từ điển `vietnameseTranslations`:

```javascript
const vietnameseTranslations = {
  // Thêm chuỗi mới ở đây
  'New string': 'Chuỗi mới',
  'Hello': 'Xin chào',
};
```

### 2. Sử dụng hook useLanguage trong Component

```javascript
import { useLanguage } from '../context/LanguageContext';

function MyComponent() {
  const { t, language, changeLanguage } = useLanguage();
  
  return (
    <div>
      <p>{t('Hello')}</p> {/* Hiển thị "Xin chào" nếu ngôn ngữ là tiếng Việt */}
      
      {/* Chuỗi với tham số */}
      <p>{t('Welcome, %{name}', { name: 'Thành' })}</p> 
    </div>
  );
}
```

### 3. Sử dụng các component đã có sẵn

Các component đã được bọc sẵn cho việc dịch văn bản:

```javascript
import { 
  Text, 
  TranslatedButton,
  TranslatedTextField,
  TranslatedDialogTitle 
} from '../components/TranslatedComponents';

function MyComponent() {
  return (
    <div>
      <Text>Hello</Text> {/* Tự động dịch */}
      
      <TranslatedButton>Save</TranslatedButton> {/* Tự động dịch */}
      
      <TranslatedTextField label="Name" /> {/* Label được dịch */}
      
      {/* Dịch với tham số */}
      <Text translateParams={{ name: 'John' }}>Welcome, %{name}</Text>
    </div>
  );
}
```

### 4. Thêm nút chuyển đổi ngôn ngữ

Component `LanguageSwitcher` đã được tích hợp vào Header và có thể được sử dụng ở bất kỳ đâu:

```javascript
import LanguageSwitcher from '../components/LanguageSwitcher';

function MyComponent() {
  return (
    <div>
      <LanguageSwitcher />
    </div>
  );
}
```

## Cấu trúc thư mục

- `/src/utils/i18n.js` - Từ điển và hàm dịch
- `/src/context/LanguageContext.js` - Provider và hook cho ngữ cảnh ngôn ngữ
- `/src/components/TranslatedComponents.js` - Các component với hỗ trợ dịch
- `/src/components/LanguageSwitcher.js` - Nút chuyển đổi ngôn ngữ

## Thêm ngôn ngữ mới

Để thêm ngôn ngữ mới (ví dụ: tiếng Pháp):

1. Tạo từ điển mới trong `i18n.js`
2. Cập nhật `LanguageContext.js` để hỗ trợ ngôn ngữ mới
3. Cập nhật `LanguageSwitcher.js` để thêm nút cho ngôn ngữ mới
