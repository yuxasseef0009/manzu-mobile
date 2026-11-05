# Manzu Pharmacy: next steps (handoff)

This is the working plan after the mobile app (M1–M8) was built. Work the tasks **in order**. Each task says which repo/branch, what to change, and how to check it. Update the **Status** column and the log at the bottom when a task moves. A new session can pick up from the first task that isn't `Done`.

Repos and branches:
- Backend: `utmemastery/manzu-backend`, branch **`med-version`** (not `main`)
- Web: `utmemastery/manzu-frontend`, branch **`med-version`** (not `main`)
- Mobile: `utmemastery/manzu-mobile`, app in `mobile/`. The detailed app plan, backend gaps (G1–G14) and decisions (D0–D6) are in `mobile/PLAN.md`

## Where things stand

| Item | State |
|---|---|
| Mobile M1–M6 | Stacked PRs [#3](https://github.com/utmemastery/manzu-mobile/pull/3) (M1 → `main`), [#4](https://github.com/utmemastery/manzu-mobile/pull/4), [#5](https://github.com/utmemastery/manzu-mobile/pull/5), [#6](https://github.com/utmemastery/manzu-mobile/pull/6), [#7](https://github.com/utmemastery/manzu-mobile/pull/7), [#8](https://github.com/utmemastery/manzu-mobile/pull/8) (M6), open |
| Mobile M7 (Profile, Staff, Register) | [PR #1](https://github.com/utmemastery/manzu-mobile/pull/1), base milestone-6 (PR #8), open |
| Mobile M8 (push behind flag, offline audit, haptics, a11y, brand icons, EAS) | [PR #2](https://github.com/utmemastery/manzu-mobile/pull/2), base milestone-7, open |
| Device testing | Not done (deferred until the build was finished) |
| Backend/web changes | Task 1 security PR open on backend `med-version` |

## Task list

| # | Task | Repo | Status |
|---|---|---|---|
| 1 | Backend security fixes (B11, G9, G13, G14 + pharmacy-ADMIN escalation) | backend `med-version` | PR open: [backend #1](https://github.com/utmemastery/manzu-backend/pull/1) (review + merge + deploy; then mobile role-edit follow-up) |
| 2 | Mobile repo hygiene: PRs for M1–M6, CI (typecheck + lint), merge chain into `main` | mobile | PRs #3–#8 open, CI on M8 branch; waiting for owner OK to merge the chain |
| 3 | Push for real (G4): `PushToken` table, register/unregister endpoints, Expo sender on order events; switch the mobile flag on | backend + mobile | Not started |
| 4 | Refresh tokens + logout (G2) and `GET /api/auth/me` (G1); return pharmacy status at login (G11) | backend + mobile | Not started |
| 5 | Orders correctness: single-order PATCH keeps `cancelReason` + restocks (G7), server-side transition graph (G10) | backend (+ mobile simplification) | Not started |
| 6 | Server-side analytics endpoint (G8) and consistent error shape (G12) | backend + mobile | Not started |
| 7 | Web portal fixes: stop calling `/api/auth/verify`, real notification bell | web `med-version` | Not started |
| 8 | Unit tests for mobile pure logic (hours formatting, GPS combine, schemas) | mobile | Not started |
| 9 | End-to-end device testing (dev build against staging backend; manager + staff accounts) | all | Not started |
| 10 | Release prep: `med-version` → `main`, deploy, Sentry, `expo-updates`, store listings, privacy policy | all | Not started |

### 1. Backend security fixes

Branch off backend `med-version`, one PR back into `med-version`.
- **G13**: `src/app.js` "DEBUG HEADER LOGGING" middleware prints every request's headers, including `Authorization` Bearer tokens. Remove it.
- **G14 (+ escalation)**: `middleware/auth.js` `authenticate` accepts any valid JWT. Pharmacy tokens carry `{userId, pharmacyId, role}`, admin tokens `{adminId, role}`.
  - An admin token on pharmacy routes has no `pharmacyId`, so queries run with `pharmacyId: undefined`.
  - `PharmacyUserRole` includes `ADMIN`, so a pharmacy user with role `ADMIN` passes `authorizeRoles('ADMIN','SUPER_ADMIN')` on `/api/admin/*`.
  - Fix: add `authenticatePharmacy` (requires `userId` + `pharmacyId`) and `authenticateAdmin` (requires `adminId`). Use them in `routes/pharmacy.js`, the pharmacy routes in `routes/auth.js`, and `routes/admin.js`.
- **G9**: `POST /api/auth/add-user` accepts any role (MANAGER/OWNER/ADMIN). Restrict it to `PHARMACIST | STAFF | TECHNICIAN` (decision D3). Let `PATCH /api/auth/users/:id` change `role` within the same set (it's dropped today).
- **B11**: `POST /api/pharmacy/change-password` overwrites the PIN hash with an 8+ char "password", which locks the user out of PIN login. Nothing calls it (web and mobile use `PATCH /api/auth/change-password`). Return `410 Gone` pointing to the right endpoint.
- Check: `node -e "require('./src/app')"`-style load check / start the server, then exercise login, profile and an admin route with each token type.
- Mobile follow-up (small): once G9 is deployed, allow role edits in `features/staff/components/StaffFormSheet.tsx`.

### 2. Mobile repo hygiene
- Open PRs for milestone-1 → `main`, milestone-2 → milestone-1, … milestone-6 → milestone-5 (same pattern as #1/#2). Merge bottom-up.
- Add `.github/workflows/mobile.yml`: Node 22, `npm ci`, `npx tsc --noEmit`, `npx eslint . --max-warnings=0` in `mobile/`. Done on the M8 branch (PR #2); it starts running for every PR once the chain reaches `main`.
- Merge order (owner approval needed): #3 → #4 → #5 → #6 → #7 → #8 → #1 → #2. Use **merge commits** (not squash) so each next PR's base stays valid; after each merge, retarget the next PR's base to `main` (GitHub does this automatically when the base branch is deleted on merge).

### 3. Push for real (G4)
- Prisma: `PushToken { id, userId, pharmacyId, token @unique, platform, createdAt, lastSeenAt }`.
- `POST /api/pharmacy/push-tokens {token, platform}` (upsert), `DELETE /api/pharmacy/push-tokens/:token` (on logout).
- Sender via Expo Push API (`expo-server-sdk`) when an order becomes PAID/ready for the pharmacy and on status changes. Payload `data: { orderId }` (the mobile app already opens `/orders/[id]` from that). Prune tokens Expo reports as `DeviceNotRegistered`.
- Mobile: point `features/push/api.ts` at the new endpoint, unregister in `signOut`, set `EXPO_PUBLIC_PUSH_ENABLED=true`.

### 4–8
See `mobile/PLAN.md` §4 rows G1, G2, G7, G8, G10, G11, G12 for the exact endpoint shapes already agreed.

### 9. Device testing
Needs: `npx eas-cli@latest init` (sets `EAS_PROJECT_ID`), EAS env vars `EXPO_PUBLIC_API_URL`, `GOOGLE_MAPS_API_KEY`. Then `eas build --profile development`. Cover login/PIN, orders (all transitions + cancel), POS sale, inventory, analytics, payment/bank (manager), profile/hours/logo/location, staff CRUD, register with GPS.

## Log
- 2026-11-05: M7 → PR #1, M8 → PR #2. This doc written; task 1 started.
- 2026-11-05: Task 1 → [backend PR #1](https://github.com/utmemastery/manzu-backend/pull/1) (not merged; middleware/schema checks run in Node, server not run against a DB). Next: merge + deploy it, then task 2.
- 2026-11-05: Task 2 → mobile PRs #3–#8 opened for M1–M6; CI workflow added to M8 branch. Next: owner approves merging the chain, then task 3.
