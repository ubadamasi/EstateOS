# EstateOS — Design System

*Established by /plan-design-review on 2026-03-29. Update this file when design decisions change — it is the canonical reference for implementation.*

---

## Product Type

**APP UI.** Not a marketing page. Calm surface hierarchy, dense but readable, utility language, minimal chrome. No decorative gradients, no ornamental icons, no 3-column feature grids.

---

## Color Tokens

```css
:root {
  /* Brand */
  --navy:         #0f2d5c;
  --navy-light:   #1a4080;

  /* Status */
  --green:        #16a34a;   /* paid, success, collected */
  --green-light:  #dcfce7;
  --red:          #dc2626;   /* unpaid, error, overdue */
  --red-light:    #fee2e2;
  --amber:        #d97706;   /* partial, warning, due soon */
  --amber-light:  #fef3c7;
  --purple:       #7c3aed;   /* disputed — used ONLY for disputes */
  --purple-light: #ede9fe;

  /* Surface */
  --surface:      #ffffff;
  --bg:           #f1f5f9;
  --border:       #e2e8f0;

  /* Text */
  --text:         #0f172a;
  --text-muted:   #64748b;
  --text-subtle:  #94a3b8;
}
```

Rules:
- No hardcoded hex values in components — always use CSS variables.
- Do not use purple for anything except disputed payment status.
- Do not add new accent colors without updating this file.

---

## Typography

**Font family:** Plus Jakarta Sans (Google Fonts). Fallback: `'Inter', system-ui, sans-serif`.

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
```

| Use case             | Size   | Weight | Color          |
|----------------------|--------|--------|----------------|
| Body / default       | 14px   | 400    | `--text`       |
| Section title        | 15px   | 600    | `--text`       |
| Card title / label   | 14px   | 600    | `--text`       |
| Table header         | 11px   | 600    | `--text-muted` |
| Badge / status       | 11px   | 600    | varies         |
| Timestamp / hint     | 12px   | 400    | `--text-muted` |
| Amount (primary)     | 18px   | 700    | `--text`       |
| Hero stat value      | 20–22px| 700–800| white or themed|
| Nav brand            | 16px   | 700    | white          |

---

## Spacing

Base unit: **4px**.

| Token      | Value |
|------------|-------|
| Card padding | 16px |
| Page horizontal padding | 20px (mobile), 24px (desktop) |
| Section gap | 24px |
| Component gap (within section) | 12px |
| Nav height | 56px |
| Table cell padding | 12px 14px |

---

## Borders & Shadows

- Border radius: **8px** (cards), **6px** (buttons), **20px** (badges), **12px** (hero cards)
- Card border: `1px solid var(--border)`
- Card shadow: `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)` — one level only
- NO decorative shadows, NO glow effects

---

## Status Badges

`<StatusBadge status="paid|unpaid|partial|overdue|disputed" />`

| Status   | Background       | Text         | ARIA label           |
|----------|------------------|--------------|----------------------|
| paid     | `--green-light`  | `--green`    | `aria-label="Paid"`  |
| unpaid   | `--red-light`    | `--red`      | `aria-label="Unpaid"`|
| partial  | `--amber-light`  | `--amber`    | `aria-label="Pending review"` |
| overdue  | `#fff1f2`        | `#be123c`    | `aria-label="Overdue"`|
| disputed | `--purple-light` | `--purple`   | `aria-label="Disputed"`|

Padding: `3px 10px`. Border radius: `20px`. Font: 11px / 600. All badges must include aria-label — color alone is not accessible.

---

## Expense Categories

`<CategoryDot category="security|maintenance|utilities|admin" />`

10px circle (`border-radius: 50%`), inline with category label. Never used without text label.

| Category     | Color     |
|--------------|-----------|
| Security     | `#3b82f6` |
| Maintenance  | `#f59e0b` |
| Utilities    | `#10b981` |
| Administration | `#8b5cf6` |

---

## Components

### AlertStrip

Top-of-page strip for urgent actions requiring chairman attention. Amber background.

- Renders ONLY if there are pending items
- Text: "X pending transfer reviews" or "Y open disputes"
- Clickable — links to relevant section
- `role="alert"` for screen reader announcement
- Never purely decorative

### TrustBanner

Green-bordered card showing the public summary link. Always visible on chairman dashboard.

- Contains: copy-link button, shareable URL, brief explanation ("Share this in WhatsApp")
- Secondary text: "Entries cannot be edited or deleted."
- Never hidden behind a settings menu

### HeroCard

Navy gradient card for resident unit summary.

- Shows: unit ID, resident name, role (landlord/tenant), 3 stats (owed / paid / overdue count)
- Mobile: same 3-column stat grid, font scales down to 16px on 375px

### StatCard

Chairman dashboard stats grid (2×2 on mobile, 4-wide on desktop).

- 4 cards: Total Collected / Total Expenses / Net Balance / Pending Reviews
- "Pending Reviews" shows count with amber indicator if >0

### EmptyState

Standard empty state for any list or table.

```
[Icon — optional, simple, not colored-circle-with-icon]
"No {items} yet."
[One sentence context]
[Primary action button]
```

Example for expense log: "No expenses recorded. Post your first expense so residents can see where funds are going." + "Add Expense" button.

### Toast

Notifications for async actions.

| Type    | Color   | Duration  | Position                      |
|---------|---------|-----------|-------------------------------|
| success | green   | 4 seconds | top-right (desktop), top-center (mobile) |
| error   | red     | 6 seconds | same |
| warning | amber   | 4 seconds | same |

Auto-dismiss. No stacking (new toast replaces old). No action buttons in toast (keep it simple).

---

## Navigation

### Chairman

**Mobile (≤768px):** Bottom tab bar, 4 tabs:
1. Dashboard (house icon)
2. Levies (list icon)
3. Expenses (receipt icon)
4. Settings (gear icon)

**Desktop (≥769px):** Left sidebar (collapsed to icons at 1024px, expanded labels at 1280px+).

Sticky top nav on all viewports: logo + estate name + user avatar.

### Resident

**Mobile:** Single scrollable page. No bottom tabs (resident has fewer actions).

**Desktop:** Sticky sidebar with: My Levies / Payment History / Community Finances.

### Public Page

No navigation — single scrollable page. No auth, no sidebar.

---

## Forms

### Expense Entry (slide-over on mobile, modal on desktop)

Fields: Category (select), Description (text), Amount (number, in ₦, stored as kobo), Date (date picker defaults to today), Receipt (file upload — optional, accepts image/pdf).

Amount >₦200,000: shows a second confirmation step before submit.
> "You're recording ₦{amount}. This cannot be edited after posting. Confirm?"
> [Cancel] [Yes, post expense]

### CSV Resident Import

- Single file input, accepts `.csv` only
- Show column mapping preview before import
- On submit: show progress bar
- On complete: "X residents imported. Y rows failed." with per-row error list

### Bank Transfer Upload (resident)

- File input (image only — jpg/png/webp)
- Preview thumbnail before submit
- On submit: "Receipt uploaded. Chairman will review within 24 hours."

---

## Responsive Breakpoints

| Breakpoint | Width    | Layout changes |
|------------|----------|----------------|
| mobile     | < 768px  | Single column, bottom tab bar (chairman), stats 2×2 |
| tablet     | 768–1023px | Two column begins, sidebar nav collapsed |
| desktop    | ≥ 1024px | Full sidebar, two-column dashboard |

Minimum supported viewport: **375px** (iPhone SE / budget Android).

---

## Accessibility

- All touch targets ≥ **44×44px**
- Color contrast: all text passes WCAG AA (4.5:1 body, 3:1 large text/UI)
  - Exception: amber badge text at 11px/600 weight — passes AA for large bold text
- ARIA landmarks: `<nav>`, `<main>`, `<footer>`, `role="alert"` on alert strip
- Table headers: `<th scope="col">` on all column headers
- Status badges: always include `aria-label` (color alone is insufficient)
- Modal (double-confirm): focus trapped, Escape key closes, returns focus to trigger
- Images (receipts): `alt="Payment receipt — [date]"` or `alt="Expense receipt — [category]"`

---

## Anti-Patterns (never do these)

- Hardcoded hex values — use CSS variables
- Purple on anything except disputed status
- Icons in colored circles
- 3-column feature grid layout
- `text-align: center` on data tables or form labels
- Decorative left-border on non-priority cards
- Toast with action buttons
- New tab for receipt viewing — use lightbox
- Hamburger menu — use bottom tab bar (mobile) or sidebar (desktop)
- `border-left: 3px solid` on decorative cards — only for overdue/critical priority

---

## Wireframe References

Visual contracts for implementation. These are the approved direction.

| Screen              | File                              |
|---------------------|-----------------------------------|
| Chairman Dashboard  | `/tmp/estateos-chairman.html`     |
| Resident Portal     | `/tmp/estateos-resident.html`     |
| Public Summary      | `/tmp/estateos-public.html`       |

Note: wireframes use static HTML with inline CSS. The production implementation uses Next.js with Tailwind CSS (or CSS modules) — translate tokens and patterns, not copy-paste.
