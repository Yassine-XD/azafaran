# Azafarán — customer app (rebuilt v1)

Apple-minimal halal-meat-delivery app. Expo + expo-router on top of an
Express/Postgres backend (see `../backend/`). Same Spanish-first feel,
totally rebuilt UI.

## Run

```bash
npm install                 # one-time
npm start                   # expo start (pick web / iOS / Android)
npm run web                 # web only, fastest dev loop
npm run android             # native, requires EAS dev-client (push needs google-services.json)
npm run lint                # expo lint
npx tsc --noEmit            # typecheck
npx expo export -p web      # static web bundle to ./dist
```

`EXPO_PUBLIC_API_HOST` overrides the API host; defaults to
`https://www.azafaran.es`. See `.env.example`.

## Architecture

### Provider order (`app/_layout.tsx`)

Bottom-up, must not be reordered without checking dependencies:

```
GestureHandlerRootView           (bottom-sheet root)
  ErrorBoundary
    SafeAreaProvider
      QueryClientProvider        (TanStack Query)
        StripeProviderWrapper    (platform split: native / web)
          LanguageProvider
            AuthProvider         (depends on LanguageProvider)
              NotificationProvider (depends on AuthProvider)
                CartProvider     (depends on AuthProvider, drains pending coupon)
                  NavigationGuard
                    NotificationsBridge   (mounted inside guard)
                    Stack
```

### State layer

- `lib/queryClient.ts` — TanStack Query, 5min stale, 10min gc, retry 1.
- `hooks/queries.ts` — typed hooks: `useProducts`, `useProduct`,
  `useCategories`, `useFeatured`, `useOrders`. Each unwraps the API
  envelope and throws on `success: false`.
- `stores/uiStore.ts` — Zustand for ephemeral UI (filters, toast,
  onboarding-shown flag).
- `contexts/CartContext.tsx` — kept as Context (auth-aware fetch,
  guest-cart merge on login, pending-coupon drain). `useCart()` is
  the only public surface for cart mutations.

### Design system

- `theme.ts` — palette (ink scale + halal green + sale red as the only
  accents), type scale, radii, shadows. Single Inter family for UI;
  tight tracking on display sizes for SF-Pro feel. JetBrainsMono only
  on prices.
- `tailwind.config.js` + `global.css` — NativeWind tokens for both
  light and dark themes via CSS variables.
- `components/ui/` — Text (Display/H1/H2/H3/Body/Small/Caption/Micro),
  Button, Card, Badge, Skeleton, Sheet (bottom sheet wrapper).
- `components/product/` — PriceBlock (the unit-pricing centerpiece),
  ProductCard, VariantPicker.

### The unit-pricing trick

`PriceBlock` is the heart of the UX. Big bold unit price ("2 entrecots
€9,90"), small grey €/kg below, optional strikethrough anchor on the
side. EU Directive 98/6/EC requires the per-kg price be visible —
hierarchy is the lever, not omission. All driven by data from
`product_variants` + `products`:

| Lever | Field |
|---|---|
| Unit price | `price` + `label` (e.g. "2 entrecots") |
| €/kg | computed from `price` × `weight_grams` |
| Anchor strikethrough | `compare_at_price` (migration 031) |
| Promo badge | `badge_label` (migration 031) |
| Low-stock urgency | `stock_qty <= low_stock_threshold` (migration 031) |
| Pack-level label | `unit_label_override` on products (migration 031) |
| Halal trust chip | `halal_cert_id` |
| Pack contents | `pack_items` rows |

Admin can flip any of these from `admin/src/pages/ProductsPage.tsx`.

### Stripe split

`StripeProviderWrapper.{native,web}.tsx` and `useStripePay.{native,
web}.tsx`. Metro picks the right file by suffix at bundle time. Two
`.d.ts` shims (`StripeProviderWrapper.d.ts`, `useStripePay.d.ts`)
satisfy TypeScript's resolver without ever being bundled — a real
shim leaks one platform's code into the other's bundle (we hit this
during the rebuild and the `.d.ts` approach is the fix).

### Push notifications

Untouched from before the rebuild — the canonical wire-format contract
documented in `../CLAUDE.md` (push notifications section) still holds.
`NotificationsBridge` handles cold-start + warm taps; `CartContext`
drains pending coupon notifications.

### i18n

`lib/i18n.ts` — three languages (`es`, `ca`, `en`). The
`const ca: typeof es = …` pattern makes TypeScript flag any missing
key. Rebuild strings live under the `rebuild.*` namespace; legacy
strings (support tickets, etc.) keep their existing namespaces. Use
`useLang().t("section.key")`.

## Routing

`app/` — expo-router file-based.

- `(tabs)/` — `index` (Home), `categories`, `orders`, `profile`. The
  legacy "Deals" tab is gone; deals surface as a Home section.
- `product/[id]`, `category/[slug]` — slide-from-right.
- `cart`, `checkout`, `login`, `register`, `terms-accept`,
  `language-select` — modal presentations.
- `onboarding` — fade transition, MVP language picker.

`NavigationGuard` is intentionally minimal: on first launch (no
`preferred_lang` AND no `onboarding_done` in AsyncStorage) it
redirects to `/onboarding`. After that, no forced redirects. Auth-
required screens enforce auth at point of use (cart routes guests
to login on checkout press; orders tab shows a login CTA when
unauthenticated).

## v1.1 backlog

Screens deferred from v1 — port the UX pattern from the new design
system, copy the *logic* from `legacy/frontend-v1` where useful:

- `app/deals.tsx` and `app/deal-detail.tsx` (full deals page)
- `app/search.tsx` (search screen with debounce + history)
- `app/addresses.tsx`, `app/edit-profile.tsx`, `app/profile-setup.tsx`
- `app/notification-preferences.tsx`
- `app/policies.tsx`, `app/article.tsx`
- `app/support.tsx`, `app/support-new.tsx`, `app/support-ticket.tsx`
- `app/order-details.tsx` (standalone — currently inline-collapse)

Polish carry-over:

- Toast component reading `uiStore.toast` (replaces some `Alert.alert`
  flows for non-critical success messages).
- Press-scale feedback on `ProductCard`/category cards.
- Staggered carousel entrance on Home deals/bestsellers.
- Coupon-expiry countdown timer in cart (needs `expires_at` on
  `AppliedPromo`).
- Ship the 3-card swipeable onboarding intro from the original plan
  (currently the screen is a language picker only).
- Replace ad-hoc Spanish copy in form labels / hints / placeholders
  with `t()` calls (Phase 9 swept the high-visibility strings; field
  labels and secondary copy still hardcoded in some screens).

Backend:

- Wire `compare_at_price` and `badge_label` into the bestsellers /
  featured query response (already returned via `SELECT *`, but
  could be promoted to indexed/sorted columns for performance).

## Verification

Sandbox-runnable checks (passing on the rebuild branch):

- `cd backend && npx tsc --noEmit`
- `cd admin && npx tsc -b && npm run build`
- `cd frontend && npx tsc --noEmit && npm run lint`
- `cd frontend && npx expo export -p web` (19 static routes)

Stack-required checks (run locally — sandbox lacks Postgres / device):

- `./azafaran dev:db:up && ./azafaran dev:migrate:up` — confirm
  migration 031 applies on a fresh DB.
- `cd backend && npm test` — confirm the new variant fields test
  passes (added to `src/tests/products.test.ts`).
- Admin smoke: edit a variant, set `compare_at_price=15.00`,
  `badge_label="Oferta"`, `low_stock_threshold=5`, save, refresh.
  Check the variant on Home/product detail surfaces all three.
- `npm run web` and step through: home → category → product (verify
  big unit price, small €/kg, strikethrough anchor) → add to cart →
  cart → apply promo (auth-gated) → checkout → Stripe test card.
- Browse-first: clear AsyncStorage, reload — should land on Home,
  not login.
- Push regression: send a `type=product` campaign from admin; tap
  on device opens the right product detail (no NotificationsBridge
  regression).

## Backup

- `frontend-v1-pre-rebuild` annotated tag (local).
- `legacy/frontend-v1` branch on origin — pristine snapshot of the
  pre-rebuild app for reference / rollback.
