# Frontend Analysis Report - UKM Kemasan ERP

---

## 1. MASALAH REACT COMPONENTS & HOOKS

### 1.1 Missing/Incorrect Hook Usage

#### Issue: `getEmptyProductForm` dibuat sebagai function bukan constant
**File:** [CustomerDashboard.jsx](CustomerDashboard.jsx#L75)
```javascript
const [newProduct, setNewProduct] = useState(getEmptyProductForm); // ❌ WRONG
// Harus:
const [newProduct, setNewProduct] = useState(getEmptyProductForm());
```
**Impact:** State tidak akan diinisialisasi dengan benar. Setiap kali component render, function baru akan dibuat.
**Fix:** Ubah `getEmptyProductForm` menjadi `getEmptyProductForm()` di setiap penggunaannya.

---

#### Issue: `resetProductForm` tidak update state dengan benar
**File:** [CustomerDashboard.jsx](CustomerDashboard.jsx#L173)
```javascript
const resetProductForm = () => {
  setNewProduct(getEmptyProductForm);  // ❌ Missing () call
};
```
**Fix:**
```javascript
const resetProductForm = () => {
  setNewProduct(getEmptyProductForm());
};
```

---

### 1.2 State Management Issues

#### Issue: `adminStats` state tidak digunakan tapi di-maintain
**File:** [CustomerDashboard.jsx](CustomerDashboard.jsx#L130)
- State `adminStats` diinisialisasi tapi tidak ada yang set nilainya dalam component

#### Issue: Multiple state selectors yang tidak konsisten
- `stockCardProductId` dan `products` bisa out of sync
- Tidak ada validation bahwa selected product ID sebenarnya ada di products list

---

### 1.3 Missing PropTypes / TypeScript

**Problem:** Tidak ada type checking untuk props
- Components menerima props tanpa validasi
- Props dapat undefined/null tanpa handling
- Menambah risk bugs saat refactoring

**Affected Components:**
- [LandingContentSettingsSection.jsx](LandingContentSettingsSection.jsx) - expects many callbacks
- [Carousel components](ui/carousel) - no prop validation
- Semua modal components

**Recommendation:** Implementasikan PropTypes atau migrasi ke TypeScript

---

## 2. STRUKTUR COMPONENTS & PAGES

### 2.1 Component Organization

```
✅ GOOD:
├── pages (top-level): LoginPage, RegisterPage, CustomerDashboard, CustomerPortal, etc.
├── features (grouped by domain)
│   ├── customer-dashboard/
│   ├── customer-portal/
│   ├── admin-sales-workspace/
│   └── customer-order/
└── shared components (ui/, config/, utils/)

⚠️ POTENTIAL ISSUES:
```

#### Issue: `AdminSalesWorkspace` adalah component besar yang di-import di `CustomerDashboard`
- Mixing admin dan customer concerns dalam 1 component
- Sulit untuk test independently
- ~500+ lines dalam satu component

**Recommendation:** Split menjadi:
```
AdminSalesWorkspace.jsx (main container)
├── sales/
│   ├── SalesProcessing.jsx
│   ├── InvoicesSection.jsx
│   ├── PaymentsSection.jsx
│   └── ReturnsSection.jsx
└── shared modals
```

---

### 2.2 Landing Content Implementation ✅

**Status:** Ada implementasi yang cukup baik
- ✅ Ada `LandingContentSettingsSection.jsx` component untuk admin manage landing content
- ✅ Ada di customer-dashboard sidebar (menu "settings")
- ✅ Ada di `CustomerPortal` untuk menampilkan articles & activities

**File Structure:**
- **Admin Management:** [LandingContentSettingsSection.jsx](LandingContentSettingsSection.jsx)
- **Utilities:** [landingContent.js](utils/landingContent.js)
- **Display Component:** CustomerPortalHomePage.jsx

**Issues Found:**

#### Issue: Duplicate `imageAlt` property
**File:** [landingContent.js](utils/landingContent.js#L71)
```javascript
imageAlt: activity.imageAlt,
imageAlt: activity.imageAlt,  // ❌ DUPLICATE!
removeImage: Boolean(activity.imageRemoved),
```
**Fix:** Hapus yang duplicate

#### Issue: PropTypes not validated
Tidak ada validasi bahwa `onSectionConfigChange` callback menerima parameter yang benar

---

## 3. API INTEGRATION ISSUES

### 3.1 Token Management & Interceptors

**Status:** ✅ Sudah ada, cukup baik

**File:** [api.js](utils/api.js)
```javascript
api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    const cleanToken = token.replace(/"/g, '');
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
});
```

**However, Issues Found:**

#### Issue: Tidak ada interceptor untuk error 401
**Problem:** Ketika token expired di tengah request, tidak ada global handling
**Current:** Ditangani di individual components dengan:
```javascript
if (error.response?.status === 401) {
  storage.clear();
  window.location.href = '/login';
}
```

**Issue:** Code duplikasi di banyak tempat
- ProductDetailPage.jsx
- CustomerPortal.jsx
- CustomerDashboard.jsx
- Dst...

**Recommendation:** Tambahkan response interceptor di `api.js`:
```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

### 3.2 API Endpoint Handling

#### Issue: Axios instance tidak menggunakan full API config
**File:** [api.js](utils/api.js#L3)
```javascript
const api = axios.create({
  baseURL: getCurrentAPIConfig().baseURL,
});
```

**Problem:**
- `timeout` configuration diabaikan
- `withCredentials` tidak dikonfigurasi

**Fix:**
```javascript
const config = getCurrentAPIConfig();
const api = axios.create({
  baseURL: config.baseURL,
  timeout: config.timeout,
  withCredentials: config.withCredentials
});
```

---

### 3.3 Error Handling Consistency

#### Issue: Inconsistent error handling patterns

**Pattern 1:** Toast + console.error
```javascript
// LoginPage
catch (err) {
  console.error('Login error:', err);
  let errorMessage = 'Login failed. Please try again.';
  if (err.response) {
    errorMessage = err.response.data?.message || 'Error message';
  }
  setError(errorMessage);
  toast.error(errorMessage);
}
```

**Pattern 2:** Only toast.error
```javascript
// CustomerPortal
catch (error) {
  toast.error('Gagal memuat data.');
}
```

**Pattern 3:** Only setError state
```javascript
// Beberapa components tidak punya toast notification
```

**Recommendation:** Buat utility function:
```javascript
// utils/errorHandler.js
export const handleApiError = (error, defaultMessage = 'Operation failed') => {
  let message = defaultMessage;
  
  if (error.response?.data?.message) {
    message = error.response.data.message;
  } else if (error.message) {
    message = error.message;
  }
  
  toast.error(message);
  if (process.env.NODE_ENV === 'development') {
    console.error(error);
  }
  
  return message;
};
```

---

## 4. MISSING / BROKEN IMPORTS

### 4.1 Environment Configuration Issues

#### Issue: Beberapa imports menggunakan `getAPIUrl` tapi definisi bisa ditemukan
**Files:** LoginPage.jsx, RegisterPage.jsx
```javascript
import { storage, ENDPOINTS, getAPIUrl } from '../config/environment';
const loginUrl = getAPIUrl(ENDPOINTS.LOGIN);
```

✅ Function ini ada dan didefinisikan di environment.js

---

### 4.2 Export Consistency Issues

#### Issue: Sidebar diekspor sebagai named export tapi diimport sebagai default
**File:** [Sidebar.jsx](Sidebar.jsx#L1)
```javascript
export function Sidebar({ ... }) { }  // ❌ Named export
```

**File:** [CustomerDashboard.jsx](CustomerDashboard.jsx#L12)
```javascript
import Sidebar from './Sidebar';  // ❌ Default import
```

**Fix:** Ubah ke consistent export:
```javascript
// Option 1: Ubah Sidebar.jsx
export default function Sidebar({ ... }) { }

// Option 2: Ubah import di CustomerDashboard.jsx
import { Sidebar } from './Sidebar';
```

---

#### Issue: Carousel component structure
**File:** [customer-portal/CustomerPortalHomePage.jsx](customer-portal/CustomerPortalHomePage.jsx)
```javascript
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
```

**Problem:** Tidak ada verifikasi bahwa `ui/carousel` ekspor semua components ini

---

## 5. ERROR HANDLING & FORM VALIDATION

### 5.1 LoginPage & RegisterPage Validation

#### Issue: Password validation hanya di RegisterPage, tidak di LoginPage
**RegisterPage:**
```javascript
if (formData.password.length < 6) {
  throw new Error('Password must be at least 6 characters.');
}
```

**LoginPage:** Tidak ada password length validation

#### Issue: Email validation tidak strict
```javascript
if (!email || !password) {
  throw new Error('Email dan password wajib diisi');
}
// Tidak ada email format checking
```

**Recommendation:**
```javascript
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

if (!validateEmail(email)) {
  throw new Error('Invalid email format');
}
```

---

### 5.2 Create Order Form Validation

#### Issue: Quantity validation kurang strict
**File:** [CreateOrderPage.jsx](CreateOrderPage.jsx#L63)
```javascript
const safeQuantity = Math.max(minimumOrder, Number(orderForm.quantity) || minimumOrder);
```

**Problem:**
- Negative numbers tidak di-reject
- Decimal numbers silently berkurang
- User tidak tahu data mereka berubah

**Better approach:**
```javascript
const validateQuantity = (qty, minOrder) => {
  const parsedQty = Number(qty);
  if (isNaN(parsedQty)) return { valid: false, error: 'Invalid number' };
  if (parsedQty < minOrder) return { valid: false, error: `Minimum ${minOrder}` };
  if (!Number.isInteger(parsedQty)) return { valid: false, error: 'Must be integer' };
  return { valid: true, value: parsedQty };
};
```

---

### 5.3 Modal Form Submission

#### Issue: Form submit tidak clear errors state
**Pattern yang terlihat:**
```javascript
const [error, setError] = useState('');
// Tapi tidak semua form clear error sebelum submit baru

const handleSave = async () => {
  // ❌ Tidak ada setError('') di sini
  try {
    // submit
  } catch (err) {
    setError(err.message);
  }
};
```

**Fix:**
```javascript
const handleSave = async () => {
  setError('');  // ✅ Clear error state
  try {
    // submit
  } catch (err) {
    setError(err.message);
  }
};
```

---

## 6. RESPONSIVE DESIGN ISSUES

### 6.1 Mobile-First Analysis

#### Issue: Sidebar hanya responsive untuk lg breakpoint
**File:** [Sidebar.jsx](Sidebar.jsx)
```javascript
// Component punya menu open/close state, bagus untuk mobile
// Tapi styling untuk sm/md screens tidak clear

<button className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 sm:right-6 sm:top-6">
  <X size={20} />
</button>
```

#### Issue: Modal width tidak responsive untuk very small screens
**File:** [shared.jsx](customer-dashboard/shared.jsx#L84)
```javascript
<div className={`relative max-h-[90vh] w-full overflow-y-auto rounded-[28px] ... max-w-lg`}>
```

**Problem:** `max-w-lg` (32rem) mungkin terlalu besar untuk mobile dengan padding

---

### 6.2 Form Layouts

#### Issue: Multi-column grids tidak selalu responsive
**Example:**
```javascript
<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
```

**Good:** Ada `grid-cols-1` untuk mobile
**But:** Inconsistent - beberapa form tidak mengikuti pattern ini

---

### 6.3 Table & Data Display

#### Issue: No horizontal scroll untuk small screens
Data tables di customer-dashboard mungkin overflow pada mobile

**Recommendation:**
```javascript
<div className="w-full overflow-x-auto">
  <table className="min-w-full">
    {/* ... */}
  </table>
</div>
```

---

## 7. ADDITIONAL ISSUES

### 7.1 Copy-Paste Errors

#### Issue: Duplicate property di landingContent payload
**File:** [landingContent.js](utils/landingContent.js#L71)
```javascript
imageAlt: activity.imageAlt,
imageAlt: activity.imageAlt,  // ❌ DUPLICATE
```

---

### 7.2 State Sync Issues

#### Issue: `products` state di CustomerDashboard tidak selalu sync dengan API
- Product bisa dihapus/diubah di satu tab
- Tab lain tidak otomatis refresh
- No cache invalidation strategy

**Recommendation:** Implement cache key atau polling untuk refetch

---

### 7.3 Loading States

#### Issue: Inconsistent loading indicators
- Ada `Loader2` spinning icons
- Ada text "Menghubungkan ke Server..."
- Ada toast error, ada console.error
- Beberapa request tidak ada loading state sama sekali

**Recommendation:** Buat custom loading hook:
```javascript
const useApiCall = (apiFn, onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn(...args);
      onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFn, onSuccess]);
  
  return { loading, error, execute };
};
```

---

### 7.4 Session Management

#### Issue: Token expiry timer di App.jsx hanya check saat route change
**File:** [App.jsx](App.jsx#L67-L88)
```javascript
useEffect(() => {
  const expiry = storage.getTokenExpiry();
  // ... timeout logic ...
}, [isAuthRoute, location.pathname, navigate]);  // Dependency pada location!
```

**Problem:** Timeout di-reset setiap kali route change, bukan berdasarkan token expiry actual
**Fix:** Gunakan useEffect yang independent dari routing

---

### 7.5 Missing TypeScript

Entire codebase menggunakan JavaScript tanpa type checking
- Tidak ada autocomplete di IDE
- Refactoring lebih risky
- Harder to document API contracts

---

## 8. PERFORMANCE ISSUES

### 8.1 Unnecessary Re-renders

#### Issue: `buildCatalogGroups` di-call di useMemo, tapi `products` berganti setiap API call
**File:** [CreateOrderPage.jsx](CreateOrderPage.jsx#L52)
```javascript
const catalogGroups = useMemo(() => buildCatalogGroups(products), [products]);
```

**Problem:** buildCatalogGroups adalah expensive operation (melihat catalog.js, ada banyak transformasi)

**Better:**
```javascript
const catalogGroups = useMemo(
  () => buildCatalogGroups(products),
  [JSON.stringify(products)]  // Use content hash for deep comparison
);
```

---

### 8.2 Cart Subscription

**File:** [CustomerPortal.jsx](CustomerPortal.jsx)
```javascript
const cartSubscription = subscribeCart((items) => {
  // Notification setiap kali cart change
  setCartItems(items);
});
```

**Potential issue:** Jika user buka banyak tab, setiap tab listen ke storage changes = multiple re-renders

---

## 9. SECURITY CONCERNS

### 9.1 Token Storage

#### Issue: Token disimpan di localStorage
- Vulnerable to XSS
- tidak secure for sensitive operations
- tidak ada token rotation

**Recommendation:**
```javascript
// Gunakan httpOnly cookies jika possible
// Atau implement refresh token strategy
// Parse JWT secara aman (jangan expose token di console logs)
```

---

### 9.2 CORS Configuration

**File:** [environment.js](environment.js)
```javascript
[ENV_MODES.PRODUCTION]: {
  withCredentials: true  // Good for cookies
}
```

Tapi ensure backend juga configure CORS dengan benar

---

## 10. SUMMARY & PRIORITY FIXES

### 🔴 HIGH PRIORITY
1. **Sidebar export/import mismatch** - akan cause runtime error
2. **`getEmptyProductForm` missing function calls** - state initialization bug
3. **Duplicate `imageAlt` property** - payload malformed
4. **Add response interceptor untuk 401** - DRY principle, security

### 🟡 MEDIUM PRIORITY
1. **Form validation consistency** - user experience
2. **Loading states inconsistency** - UX
3. **Type safety dengan PropTypes/TypeScript** - maintainability
4. **API config timeout/credentials** - reliability
5. **Mobile responsiveness edge cases** - device compatibility

### 🟢 LOW PRIORITY
1. **Session timeout logic** - works but could be cleaner
2. **Performance optimization** - app runs fine now
3. **Code organization refactoring** - nice to have
4. **Custom hooks untuk API calls** - DRY principle

---

## 11. RECOMMENDED NEXT STEPS

1. **Quick Wins (< 1 hour):**
   - Fix Sidebar import/export
   - Fix getEmptyProductForm calls
   - Fix duplicate imageAlt
   - Add response interceptor

2. **Short-term (1-2 hours):**
   - Implement email validation utility
   - Standardize form error handling
   - Add PropTypes to critical components
   - Improve mobile responsiveness

3. **Medium-term:**
   - Migrate to TypeScript
   - Implement custom hooks pattern
   - Refactor large components
   - Add comprehensive error boundary

