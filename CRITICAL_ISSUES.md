# Frontend Critical Issues - Quick Reference

## 🔴 CRITICAL ISSUES (Fix Immediately)

### 1. Sidebar Export/Import Mismatch
**Status:** Will cause runtime error ❌
**File:** [Sidebar.jsx](src/app/components/Sidebar.jsx#L20)
```javascript
// WRONG - Named export
export function Sidebar({ ... }) { }

// SHOULD BE (Pick one):
// Option 1: Default export
export default function Sidebar({ ... }) { }

// Option 2: Or change import to:
import { Sidebar } from './Sidebar';
```

**Impact:** Any component importing `import Sidebar from './Sidebar'` will fail

---

### 2. Function Call Missing Parentheses
**Status:** State initialization bug ❌
**File:** [CustomerDashboard.jsx](src/app/components/CustomerDashboard.jsx#L75)
```javascript
// Line 75 - WRONG
const [newProduct, setNewProduct] = useState(getEmptyProductForm); // ❌

// Line 173 - WRONG  
const resetProductForm = () => {
  setNewProduct(getEmptyProductForm);  // ❌ Missing ()
};

// MUST BE:
const [newProduct, setNewProduct] = useState(getEmptyProductForm());
const resetProductForm = () => {
  setNewProduct(getEmptyProductForm());
};
```

**Impact:** newProduct state will be a function reference instead of object, causing form to fail

---

### 3. Duplicate Property in Payload
**Status:** Payload malformed ❌
**File:** [utils/landingContent.js](src/app/utils/landingContent.js#L70-71)
```javascript
// WRONG - Duplicate property
imageAlt: activity.imageAlt,
imageAlt: activity.imageAlt,  // ❌ DUPLICATE!
removeImage: Boolean(activity.imageRemoved),

// SHOULD BE:
imageAlt: activity.imageAlt,
removeImage: Boolean(activity.imageRemoved),
```

**Impact:** Second property overwrites first, but both unused bytes

---

### 4. API Error 401 Not Globally Handled
**Status:** Code duplication across 5+ files ❌
**Pattern Found:** 
- [ProductDetailPage.jsx](src/app/components/ProductDetailPage.jsx#L42)
- [CustomerPortal.jsx](src/app/components/CustomerPortal.jsx#L89)
- [CustomerDashboard.jsx](src/app/components/CustomerDashboard.jsx#L399)
- [Sidebar.jsx](src/app/components/Sidebar.jsx#L98)
- [CustomerNavbar.jsx](src/app/components/customer-portal/CustomerNavbar.jsx#L36)

```javascript
// Problem - Code duplicated everywhere
if (error.response?.status === 401) {
  storage.clear();
  window.location.href = '/login';
}

// Solution - Add to api.js
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

**Impact:** Maintenance nightmare, inconsistent behavior

---

### 5. API Config Not Fully Applied
**Status:** Config ignored ❌
**File:** [utils/api.js](src/app/utils/api.js#L3)
```javascript
// WRONG - Only baseURL used, timeout & credentials ignored
const api = axios.create({
  baseURL: getCurrentAPIConfig().baseURL,
});

// CORRECT:
const config = getCurrentAPIConfig();
const api = axios.create({
  baseURL: config.baseURL,
  timeout: config.timeout,
  withCredentials: config.withCredentials
});
```

**Impact:** Timeout won't work, credentials won't be sent correctly

---

## 🟡 HIGH PRIORITY (Fix In This Sprint)

### 6. Direct window.location.href Instead of useNavigate
**Status:** Not using React Router pattern ⚠️
Files with issue:
- ProductDetailPage.jsx (confirmed)
- CustomerPortal.jsx (confirmed)
- CustomerDashboard.jsx (confirmed)
- Sidebar.jsx (confirmed)
- CustomerNavbar.jsx (confirmed)

```javascript
// WRONG - Using window.location
window.location.href = '/login';

// CORRECT - Use useNavigate
const navigate = useNavigate();
navigate('/login', { replace: true });
```

**Impact:** Full page reload instead of SPA navigation, breaks animation state

---

### 7. Inconsistent Form Validation
**Status:** Missing email validation ⚠️
**Files:**
- [LoginPage.jsx](src/app/components/LoginPage.jsx) - No email format check
- [RegisterPage.jsx](src/app/components/RegisterPage.jsx) - Has password validation, no email validation

```javascript
// MISSING in LoginPage:
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Add validation before login attempt
if (!validateEmail(email)) {
  throw new Error('Invalid email format');
}
```

**Impact:** Server rejects invalid emails, poor UX

---

### 8. Quantity Input No Validation
**Status:** Accepts negative/decimal numbers ⚠️
**File:** [CreateOrderPage.jsx](src/app/components/CreateOrderPage.jsx#L63)
```javascript
// Current - Silent fail
const safeQuantity = Math.max(minimumOrder, Number(orderForm.quantity) || minimumOrder);

// Should validate:
const parseQuantity = (value, minOrder) => {
  const num = Number(value);
  if (isNaN(num)) return null;
  if (num < minOrder) return null;
  if (!Number.isInteger(num)) return null;
  return num;
};
```

**Impact:** User enters value, it silently changes without notification

---

## 🟠 MEDIUM PRIORITY (Fix Next Sprint)

### 9. Missing PropTypes/TypeScript
**Status:** No type safety 📋
**Affected:** Entire codebase
- No IDE autocomplete
- Props can be undefined without notice
- Harder to refactor
- Harder to document

**Top Priority Components:**
- LandingContentSettingsSection (10+ props)
- AdminSalesWorkspace (15+ props)
- VariantSelectorSection (14+ props)

---

### 10. Large Monolithic Components
**Status:** Hard to maintain 📋
**Components Over 500+ Lines:**
- AdminSalesWorkspace.jsx
- CustomerDashboard.jsx
- CustomerPortal.jsx

**Recommendation:** Break into smaller feature-based components

---

### 11. Loading States Inconsistent
**Status:** Different patterns used 📋
Pattern 1: Spinner + text
```javascript
<Loader2 className="animate-spin" />
<p>Menghubungkan ke Server...</p>
```
Pattern 2: Only error toast
```javascript
toast.error('Gagal memuat data.');
```
Pattern 3: No feedback

**Fix:** Create custom hook:
```javascript
const useLoadingState = () => {
  const [loading, setLoading] = useState(false);
  const withLoading = useCallback(async (fn) => {
    setLoading(true);
    try { return await fn(); }
    finally { setLoading(false); }
  }, []);
  return [loading, withLoading];
};
```

---

## 📋 SUMMARY TABLE

| Issue | File | Line | Severity | Type |
|-------|------|------|----------|------|
| Sidebar export mismatch | Sidebar.jsx | 20 | 🔴 CRITICAL | Export/Import |
| Missing () on function call | CustomerDashboard.jsx | 75, 173 | 🔴 CRITICAL | Hook |
| Duplicate imageAlt property | landingContent.js | 71 | 🔴 CRITICAL | Payload |
| No global 401 handler | api.js | - | 🔴 CRITICAL | Config |
| API config not applied | api.js | 3 | 🔴 CRITICAL | Config |
| Direct window.location | Multiple | - | 🟡 HIGH | Navigation |
| Missing email validation | LoginPage.jsx | - | 🟡 HIGH | Validation |
| No quantity validation | CreateOrderPage.jsx | 63 | 🟡 HIGH | Validation |
| No PropTypes/TS | ALL | - | 🟠 MEDIUM | Type Safety |
| Large components | Multiple | - | 🟠 MEDIUM | Architecture |
| Inconsistent loading | Multiple | - | 🟠 MEDIUM | UX |
| Session timeout logic | App.jsx | 67 | 🟠 MEDIUM | Auth |

---

## ✅ WHAT'S WORKING WELL

1. ✅ Landing content management implemented
2. ✅ Cart system well-designed
3. ✅ Catalog grouping logic solid
4. ✅ Role-based routing working
5. ✅ Auth token implementation decent
6. ✅ Responsive design mostly good
7. ✅ UI component library in place

---

## 🚀 QUICK FIX CHECKLIST (< 30 mins)

- [ ] Fix Sidebar export to default
- [ ] Add () to getEmptyProductForm calls (2-3 locations)
- [ ] Remove duplicate imageAlt in buildLandingContentPayload
- [ ] Add response interceptor for 401 in api.js
- [ ] Apply timeout & credentials to axios config

---

## 📟 FOLLOW-UP ITEMS

1. Review all form submissions for error clearing
2. Add email validation utility
3. Review cart subscription in multiple tabs
4. Check modal accessibility (focus management)
5. Test mobile responsiveness on actual devices
6. Review session timeout implementation
7. Plan TypeScript migration

