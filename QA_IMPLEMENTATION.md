## Implementation Roadmap: UKM Kemasan ERP Frontend
## This roadmap guides the evolution of the frontend from its current state to a production-ready enterprise system.

## Phase 1: Stabilization & Foundation (Immediate)
## Goal: Eliminate critical bugs and technical debt to create a reliable baseline.

### Critical Bug Fixes:
    *   [x] Fix react-hooks/rules-of-hooks in CreateOrderModal.jsx (Conditional hooks are a critical failure point).
    *   [x] Resolve all remaining ESLint errors and warnings across the codebase.
    *   [x] Audit and unify all API endpoint references in environment.js.
### UX/UI Polish:
    *   [x] Implement a global Error Boundary to prevent app crashes on unexpected errors.
    *   [x] Standardize loading states across all sections using the existing Skeleton components.
    *   [x] Ensure 100% responsiveness for the Admin Dashboard on tablet and mobile views.
### Security:
    *   [x] Implement stricter Route Guarding to prevent unauthorized access to /admin via URL manipulation.

## Phase 2: Feature Completion & Enhancement (Short-Term)
## Goal: Fill functional gaps and optimize core business workflows.

### Inventory Module:
    *   [ ] Implement the Stock Opname page (currently an EmptyState).
    *   [ ] Add "Bulk Import/Export" functionality for products using Excel/CSV.
    *   [ ] Enhance Stock Card filters (filter by date range, reference type).
### Sales & Order Module:
    *   [ ] Build a more robust "Order Preview" before submission.
    *   [ ] Implement "Invoice PDF" generation/download for customers.
    *   [ ] Add a "Payment History" view within the Order Detail page.
### Admin Intelligence:
    *   [ ] Expand the ReportsPage with actual data visualizations (Revenue trends, Category performance).
    *   [ ] Implement a "Notification Center" for low-stock alerts and new orders.

## Phase 3: Performance & Scaling (Medium-Term)
## Goal: Optimize for speed, maintainability, and larger data sets.

### State Management:
    *   [ ] Transition from prop-drilling to a state management library (e.g., Zustand or Redux Toolkit) for global data like user, cart, and settings.
    *   [ ] Implement React Query (TanStack Query) for server-state management (caching, automatic re-fetching, and loading states).
### Advanced DX (Developer Experience):
    *   [ ] Implement a full suite of Unit and Integration tests (per the QA Plan).
    *   [ ] Setup a CI/CD pipeline for automated linting and testing on every Pull Request.
### Optimization:
    *   [ ] Implement Virtual Scrolling for large inventory and order lists to maintain 60fps.
    *   [ ] Optimize image loading using lazy-loading and optimized formats (WebP).

## Phase 4: Enterprise Expansion (Long-Term)
## Goal: Add high-value business features and platform stability.

### Collaboration Tools:
    *   [ ] Add "Internal Notes" for Admin users on specific orders or products.
    *   [ ] Implement "Activity Logs" (Audit Trail) to track who changed stock or order statuses.
### Advanced Integrations:
    *   [ ] Deep integration with payment gateways (Midtrans/Xendit) for automatic "Lunas" status updates.
    *   [ ] Integration with shipping APIs for real-time tracking within the portal.
### Self-Service Portal:
*   [ ] Allow customers to manage their own profiles and address books.
    *   [ ] Implement an "Order Tracking" timeline for customers.