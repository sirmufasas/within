# What changed in this pass

## 1. Fixed real compile/runtime bugs
- `src/lib/supabase/client.ts`, `server.ts`, `src/middleware.ts` — fixed implicit `any`
  TypeScript errors on the Supabase cookie handlers (`tsc --noEmit` now passes clean).
- `src/components/ui/LoadingSkeleton.tsx` — `ChartSkeleton` was passing a `style` prop
  that the `Skeleton` component didn't accept. Fixed the type and passthrough.
- `src/app/profile/page.tsx` — the Profile screen was saving a `phone` field to a
  database column that didn't exist (`user_profiles.phone`), so saves silently failed
  while still showing a "success" toast. Added the missing migration column, updated
  the `UserProfile` type, and fixed the save handler to surface real errors.

## 2. Drivers & Deliveries — built and wired to Supabase (new)
- New migration: `supabase/migrations/20260722160000_drivers_deliveries.sql`
  - `drivers` table (business-scoped, RLS matching your existing pattern)
  - `deliveries` table (business-scoped, links to drivers, status tracking)
- Rewrote `src/app/drivers/page.tsx` — this was previously 100% hardcoded mock data
  with non-functional buttons. Now:
  - Loads real drivers/deliveries for the logged-in business on page load
  - "Add Driver" / "Edit Driver" / "Remove Driver" all write to Supabase
  - "Add Delivery" writes to Supabase, assignable to a driver
  - Delivery status dropdown updates the database (with optimistic UI + rollback on error)
  - Loading skeletons and empty states instead of always-populated mock content

## 3. Reports — now wired to real data, with important caveats

`src/app/reports/page.tsx` now queries `order_submission_items` joined to
`order_submissions`, `products`, and `customers`, filtered by your business and
the selected time period (This Month / Last 6 Months / This Year). It computes
real revenue, order counts, top products, and customer revenue share client-side.

**Please verify these before trusting the numbers:**

1. **I could not test this against your live database.** The nested-filter query
   (`.eq('order_submissions.business_id', ...)` on an embedded join) is standard
   PostgREST syntax and should work, but I have no way to confirm it from here.
   Load the Reports page and check the browser console for errors — if the join
   fails, you'll see a toast error and an empty report rather than a crash, but
   please tell me if that happens so I can fix the query shape.
2. **Revenue is calculated using each product's *current* `selling_price`**, not
   the price at the time of the order (no `unit_price` is stored per order line
   in your schema). If you change a product's price, historical months will
   recalculate using the new price. If accurate historical revenue matters, the
   fix is to add a `unit_price` column to `order_submission_items` and stamp it
   in at order-creation time — I haven't done this yet since it also means
   changing how orders get created, which is a bigger decision.
3. **If any product in the period has no `selling_price` set**, the page shows a
   visible warning banner rather than silently under-reporting.
4. **RLS on `customers`, `products`, and `order_submissions` isn't in this repo's
   migrations** — it was set up directly in your live project before these
   migrations existed. The report code filters by `business_id` explicitly, but
   I can't confirm from here whether Row Level Security is actually enforcing
   isolation server-side too. Worth checking in Supabase's Authentication >
   Policies tab that these three tables have RLS enabled.

## 4. Products — wired to real data

`src/app/products/page.tsx` rewritten to use the real `products` table columns
(`ingredients` not `description`, no flat `stock` column — see below) instead of
the mock schema the old page assumed.

**Key differences from the mock version, worth knowing:**

- **Stock is computed by summing `stock_batches.quantity`** for each product,
  not a flat number on the product row (your real schema doesn't have one —
  stock lives in batches, which is actually the correct Phase 3 design).
  **This means any product you add here will show 0 stock until the Inventory
  page is also wired to create real batches** — that page is still mock, so
  right now there's no way to add real stock through the UI yet. Not a bug,
  just an honest gap until Inventory gets the same treatment.
- **Delete is now "Deactivate"** (toggles `is_active`), not a hard delete. Your
  `products` table is referenced by order history, stock batches, and customer
  saved items — hard-deleting could orphan that data or fail outright depending
  on foreign key rules I can't see from here. Deactivated products are hidden
  from the default view but can be shown again and reactivated.
- **Category is now a free-text field** (with autocomplete from existing values)
  rather than a hardcoded dropdown list, since your schema has no separate
  categories table — `category` is just a text column on `products`.
- Added a real "Image URL" field since `products.image_url` exists in your
  schema, even though the old mock UI never surfaced it.

## 6. Orders — wired to real data, with a schema extension

Your real `order_submissions`/`order_submission_items` schema had **no status
workflow, no payment tracking, no driver assignment, and no notes field** — and
`customers` had no `phone`/`address`. The mock Orders page assumed all of these
existed. Rather than build a crippled version or fabricate data, I extended the
schema additively (new migration:
`20260722170000_order_workflow_fields.sql`):

- `order_submissions` gained: `status`, `payment_status`, `driver_id` (links to
  the new `drivers` table), `delivery_date`, `notes`
- `order_submission_items` gained: `unit_price` — **stamped at order-creation
  time** from the product's current selling price, so future orders keep
  accurate historical pricing even if you change a product's price later
- `customers` gained: `phone`, `address`

**Everything is `ADD COLUMN IF NOT EXISTS`** — nothing renamed or dropped, so
the Google Sheet sync implied by `synced_to_sheet`/`sheet_row` should keep
working unchanged. New orders created from admin are tagged `order_type =
'manual'` to distinguish them from whatever the original sync process writes.

**`src/app/orders/page.tsx` rewritten** with real Supabase CRUD:
- Create/Edit orders with customer, driver, delivery date, status, payment
  status, notes, and a line-item editor (product + quantity + price, price
  auto-fills from the product but is editable per line)
- Inline status dropdown in the table (optimistic update, rolls back on error)
- View/Edit/Delete all real; delete removes the order and its items
- Reports (`src/app/reports/page.tsx`) updated to prefer the new stored
  `unit_price` when present, falling back to the product's current price only
  for old rows that predate this change — this fixes the historical-accuracy
  gap flagged in the previous Reports notes, going forward.

**Not tested against your live database** — same caveat as everything else so
far. If creating or editing an order throws an error, send me the exact
message and I'll fix the query/insert shape.

## 8. NEW: Public customer ordering portal (`/order/[token]`)

You linked https://orderingsytem.netlify.app/order/alberton-meat and asked for
this functionality. Important context: **this is a brand new feature** —
everything previously called "Customer Portal" in the admin sidebar was staff
viewing customer data, not the actual public ordering page. That page didn't
exist in WITH-IN at all before this.

**How it works:** each customer gets a secret link (`/order/<random-token>`,
no login) showing their curated product list (from `customer_products`) with
quantity steppers, matching the reference site's UX. Submitting creates a real
order for the next day. A History tab shows past orders.

**Why a token instead of a guessable slug like the reference site:** the
original site is single-tenant, so a guessable URL only exposed one bakery's
data. On a multi-tenant platform, a guessable customer slug could let someone
view or order as a different business's customer. Your schema already had an
unused `customer_portal_access.portal_token` column clearly meant for this —
so this uses that instead of copying the guessable-slug approach.

**New migration:** `20260722180000_customer_portal_tokens.sql`
- Adds a uniqueness constraint on `portal_token`
- Auto-generates a portal token for every new customer going forward (DB trigger)
- Backfills a token for every existing customer that doesn't have one yet

**Required setup — this feature will not work without it:**

You need to add a `SUPABASE_SERVICE_ROLE_KEY` environment variable (Netlify:
Site settings > Environment variables, and your local `.env` — already has a
placeholder with instructions). Find the value in Supabase: Project Settings >
API > `service_role` key. **This key must never be prefixed `NEXT_PUBLIC_`** —
it's used only in server-side code (`src/lib/supabase/admin.ts`) and must never
reach the browser. It bypasses Row Level Security entirely, which is why the
token itself is the security boundary — every read/write in this feature
re-validates the token server-side before touching any data.

**How to actually get a customer's link right now:** there's no admin UI yet
to view/copy a customer's portal link (that belongs with the Customers page
rewrite, which is still mock). Until then, run this in the Supabase SQL
Editor to get a working link for testing:
```sql
select c.name, cpa.portal_token
from public.customers c
join public.customer_portal_access cpa on cpa.customer_id = c.id
where c.business_id = '<your business id>';
```
Then visit `https://<your-site>/order/<portal_token>`.

**Also worth knowing:** if a customer has no rows in `customer_products` yet
(no curated product list assigned), their order page will show "No products
available yet" — there's also no admin UI to assign a customer's product list
yet. That, plus the portal-link viewer above, are the natural next pieces once
Customers gets the same treatment as Orders/Products.

## 9. IMPORTANT — unrelated to this feature, found while working: your `.env`
was not gitignored. Fixed `.gitignore` going forward, but **please check
whether `.env` was ever committed to your GitHub repo** (`git log --all --
.env` locally). If it was, treat every key currently in that file as
potentially exposed and rotate them — Supabase keys, and your Anthropic,
OpenAI, Gemini, Perplexity, and Stripe keys.

## 11. Customers — wired to real data, closes the ordering loop

`src/app/customers/page.tsx` rewritten. This is the piece that actually makes
the customer ordering portal usable day-to-day:

- **Copy order link** — every customer row has a link icon that copies their
  `/order/<token>` link straight to your clipboard, ready to text or email
  them. Also shown in full in the customer detail view.
- **Manage Products** — a checklist modal to control exactly which products
  show up on a given customer's order page (writes to `customer_products`
  immediately per toggle, no separate save step).
- Add/Edit customers with the real fields your schema actually has (name,
  phone, address, driver) — no more fake email/contactPerson/status fields
  that don't exist in your database.
- Orders count and revenue per customer computed from real order data (same
  approach as Reports/Orders).
- **Delete is blocked if the customer has any order history** — you'll see a
  clear message instead of a silent failure or, worse, a delete that
  succeeds and orphans real order records.

**One assumption flagged, not verified:** `customer_products.sheet_row` is a
required column I don't fully understand the original purpose of — it looks
tied to whatever process syncs orders to your Google Sheet. When assigning a
product to a customer here, I set `sheet_row` to a simple incrementing number
rather than leave it blank (it's `NOT NULL`). **If your sheet-sync process
expects `sheet_row` to mean something specific** (e.g. an actual spreadsheet
row number it reads from), this could conflict with it — worth checking before
relying on this for customers whose orders also flow through the sheet.

## 13. Inventory — wired to real data (this is what makes Products' stock counts real)

`src/app/inventory/page.tsx` rewritten against the real
`warehouses`/`stock_locations`/`stock_batches`/`stock_movements`/`suppliers`
schema (this schema already existed from the very first migration pass —
today was the first time anything actually read or wrote to it).

- **Warehouses**: add/delete, with nested **Locations** management per warehouse
- **Receive Stock**: creates a real `stock_batches` row *and* a matching
  `stock_movements` audit entry (`movement_type: 'purchase'`) — this is what
  finally gives products non-zero stock on the Products page
- **Transfer**: moving a batch's full quantity just relocates it; moving a
  partial quantity splits it — shrinks the original batch and creates a new
  batch row at the destination, with a `transfer` movement logged either way
- Expiry status (Good/Expiring/Critical/Expired) computed from real dates,
  not hardcoded
- Quick "+ New" supplier creation inline from the Receive Stock modal, since
  there's no full Suppliers page yet

**Not built this pass:** a dedicated Suppliers management page (Purchase
Orders page is still the old mock too) — Phase 3 lists these separately, and
today's pass focused on what unblocks Products/Reports (stock quantities).

**Not tested against your live database** — same standing caveat. One thing
in particular worth checking yourself: the Movements table has *two* foreign
keys to `stock_locations` (from/to), and I referenced Postgres's default
auto-generated constraint names (`stock_movements_from_location_id_fkey` /
`..._to_location_id_fkey`) to disambiguate the join. If your actual database
named these differently, the Movements tab query will fail — send me the
error if so and I'll fix the constraint name.

## 15. Netlify deployability — checked with an actual production build

**Good news first:** I ran a real `next build` (not just type-checking) in a
sandboxed copy of your project, and it succeeded cleanly, including
`/order/[token]` correctly compiling as a dynamic server-rendered route —
that's the concrete proof the new Server Actions/Server Components
architecture actually works, not just that it type-checks.

**But I found real gaps that would likely have caused problems on Netlify,
now fixed:**

1. **No `netlify.toml` existed at all.** Your `@netlify/plugin-nextjs`
   dependency was listed in `package.json` but never actually activated via
   config — it was relying entirely on Netlify's auto-detection, which is
   usually fine but not guaranteed, especially for a project with Server
   Actions. Added an explicit `netlify.toml` pinning the plugin and build
   command.
2. **No Node version was pinned anywhere** (`package.json`, `.nvmrc`).
   Next.js 15 + React 19 need Node 18.18+, ideally 20.x. Without pinning,
   Netlify could pick an older default Node version and either fail the
   build or behave subtly differently than your local machine. Added
   `.nvmrc` (Node 20), an `engines` field in `package.json`, and
   `NODE_VERSION = "20"` in `netlify.toml`.

**Things I could not verify from here — please check on Netlify's side:**

- **Environment variables must be set in Netlify's dashboard** (Site
  settings > Environment variables), not just your local `.env` — that file
  is gitignored and never gets deployed. You need: `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the new
  `SUPABASE_SERVICE_ROLE_KEY` (required for the customer order portal — see
  section 8). **Double-check that last one is NOT prefixed `NEXT_PUBLIC_`**
  in Netlify's UI — that prefix would leak it to the browser.
- Your `next.config.mjs` reads a `DIST_DIR` environment variable to override
  the build output folder. I didn't find it set anywhere, so it defaults to
  `.next` correctly — but if Netlify's dashboard has a leftover `DIST_DIR`
  env var from earlier configuration, it could conflict with the `publish =
  ".next"` path I just set in `netlify.toml`. Worth a quick check.
- `next.config.mjs` also has `typescript: { ignoreBuildErrors: true }` and
  `eslint: { ignoreDuringBuilds: true }` — meaning Netlify's build will
  succeed even if there are type or lint errors. I've kept everything
  type-clean throughout, but this means Netlify's build passing isn't by
  itself proof that the code is correct — worth knowing.

## 17. Loading states — audited and fixed across every real page

Sign-in and sign-up already had proper spinners (good news, nothing to fix
there). But across Products, Orders, Customers, Inventory, and Drivers, save/
delete/transfer buttons were disabled during saves (so no double-submits) but
had **no visible spinner** — just a text change, which is exactly the "did
this freeze?" feeling you flagged. Fixed all ~14 of them to show a spinning
indicator, matching the pattern already used on sign-in/sign-up. Also added a
matching spinner to the customer order portal's "Submit Order" button.

## 18. PWA installability — added

- `public/manifest.webmanifest` — app name, theme color, icons
- Generated proper icon sizes (192px, 512px, maskable 512px, 180px Apple
  touch icon) from your existing `app_logo.png`
- Root layout now links the manifest and icons, with `apple-mobile-web-app`
  meta tags for iOS "Add to Home Screen"
- `public/sw.js` — a minimal service worker. **Deliberately does NOT cache
  API/data requests** — this app's data (orders, stock, prices) is live
  business data and must never be served stale from a cache. It only caches
  static assets (icons, manifest) and falls back to a cached shell if
  completely offline. This satisfies installability criteria without risking
  someone seeing yesterday's stock levels.

Verified with a real production build both before and after these changes —
both succeeded.

## 19. What "do all of them" still means — being honest about scope

You asked me to finish Staff Management, Accounting, Subscriptions, Purchase
Orders + Suppliers, and the Super Admin panel, **plus** verify every button
works with no lag across the whole app, **plus** a full responsive pass, all
in one turn. I did the two genuinely boundable pieces (loaders, PWA) above,
fully and to the same bar as everything else. But rebuilding five more major
feature areas — each the size of Orders or Inventory, which took a full
dedicated pass each — isn't something I can also do properly in the same
response without the quality dropping. Every page I've built already uses
responsive Tailwind classes (`sm:`/`md:`/`lg:` breakpoints, hidden columns on
small screens) as a baseline, but a genuine device-by-device audit of the
*entire* app is its own piece of work, not a checkbox alongside five new
features. Continuing feature-by-feature, same as every step so far.

## 21. Branded loading overlay — logo rises from bottom, spins, centered pop-up

New component: `src/components/ui/LoadingOverlay.tsx`, using the logo you
uploaded (saved to `public/assets/images/loader-logo.png`). It's a full-screen
overlay: the logo starts below the viewport, rises up into the center with a
fade, and spins continuously while visible — matches what you described.

Wired into the three moments you named specifically:
- **Sign in** — shows while waiting on the auth request
- **Sign up** — shows while your workspace is being created
- **Customer order submission** — shows while the order is being written

Note: there's a *separate*, pre-existing full-page loader
(`src/components/WithinLoader.tsx` — the dark sci-fi-styled one with the scan
line and grid background) used for full-page/route transitions like the
initial "Loading your workspace..." screen. I left that alone and built this
as a distinct, lighter component for in-the-moment button actions, since they
serve different purposes.

**Not yet applied to:** the save/delete actions in Products, Orders,
Customers, Inventory, Drivers — those still use the small inline button
spinners added last pass, which are appropriate for quick modal actions.
Say the word if you'd like the full overlay on those too.

## 23. Theme color now actually applies across the whole app

Found the gap: `primary_color` was already being captured at signup and saved
to the `businesses` table (and editable later in Settings) — but nothing
actually *read* it anywhere except the customer order portal. Every button,
sidebar accent, and badge across the admin app was hardcoded to indigo
regardless of what a business picked.

**Fixed with one small, central change** rather than touching every page:
`bg-primary` / `text-primary` / `border-primary` / `.btn-primary` (used
everywhere across every page I've built) all read from a CSS variable,
`--primary`. New `src/app/ThemeSync.tsx` keeps that variable in sync with the
signed-in business's `primary_color`, mounted once at the root layout — so
every page automatically picks it up with no per-page changes needed.

Also fixed the avatar/logo gradient circles (`.within-gradient`, used in 17
files — Drivers, Customers, Orders, etc.) which were a completely separate
hardcoded indigo-to-purple gradient, unrelated to `--primary`. These now
derive from the business's theme color too, using CSS `color-mix()`.

**Already wired for this to "just work":** both Settings and Business Settings
already called `refreshBusiness()` after saving a new color, which updates
the shared business state — so changing your theme later reflects instantly,
no page reload needed.

Verified with a full production build, before and after.

## 25. Fixed real causes of perceived lag, plus sidebar active state

**Found and fixed three real issues**, not just cosmetic tweaks:

1. **`middleware.ts` was making a real network round-trip to Supabase's auth
   server on almost every click** — including your public customer order
   links and the login/signup page, which never needed it. Every navigation
   was paying that latency. Now skips the auth check entirely on `/order/*`
   and the root login/signup page.
2. **`package.json`'s `"start"` script was actually running the dev server**
   (`next dev`), not a production server (`next start`). Dev mode is always
   noticeably slower — every route recompiles the first time you visit it,
   plus React's dev-mode overhead. Fixed to run `next start` properly.
3. **Sidebar active-state highlight was too subtle to register as "selected"**
   — just a faint tinted background. Strengthened to a clear gray background
   with bold, theme-colored text, matching what you asked for.

**Important, please check this yourself:** if you've been testing inside
Rocket's live preview (not your actual deployed Netlify site), what you're
feeling may be **inherent Next.js dev-server behavior**, not a bug — dev mode
is always slower than production, by design, everywhere, for every Next.js
app. The real test is your deployed Netlify URL (which builds with `next
build` via the `netlify.toml` I added, always producing the fast, optimized
version) — if it's still laggy there after these fixes, that's a genuine
issue and I'd want the specific page/action that's slow to dig further.

## 27. Purchase Orders + Suppliers — wired to real data, closes the Inventory loop

`src/app/purchase-orders/page.tsx` rewritten against the real
`suppliers`/`purchase_orders`/`purchase_order_items` schema.

- **Suppliers**: full CRUD (add/edit/deactivate), with real order count and
  total spent computed from actual purchase order history
- **Purchase Orders**: create with real line items (product + quantity + unit
  cost, auto-filled from the product's cost price), status workflow
  (draft/sent/partial/received/cancelled) via inline dropdown
- **"Receive" actually creates real stock** — this is the piece that closes
  the loop with Inventory. Confirming receipt creates real `stock_batches`
  rows (visible immediately on the Products/Inventory pages) and matching
  `stock_movements` audit entries, updates how much of each line item has
  been received, and automatically marks the PO `partial` or `received`
  depending on whether everything ordered has arrived yet.

Not tested against your live database — same standing caveat as everything
else. The receiving flow in particular does several sequential writes (batch,
movement, item update, PO status) — if anything in that chain errors partway
through, send me the exact message and I'll check the sequence.

## 28. Still mock-only (not touched this pass)
customers, orders, products, inventory, estimates, purchase-orders (the table data),
staff-management, subscription, customer-portal (all sub-pages), and every
super-admin-panel screen. These all look finished in the UI but write to local
state only. Worth tackling next, one at a time, the same way Drivers was just done.

## Before you deploy
Run the new migrations in Supabase (SQL Editor, in order):
1. `20260722150000_user_profile_phone.sql`
2. `20260722160000_drivers_deliveries.sql`
