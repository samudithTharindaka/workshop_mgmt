# Workshop Portal — current UI inventory (design handoff)

This document describes the **existing** Workshop Management Vue portal as shipped today: routes, copy, controls, and layout blocks. Use it for redesign in Stitch, Figma, Claude, etc.

**Stack:** Vue 3, Vue Router, Tailwind-style utility classes, embedded in Frappe (Desk session / CSRF).  
**Base URL (production build):** `/workshop/` (dev server may use `/`).  
**Shell:** `App.vue` — sticky header, scrollable main, footer.

---

## Global chrome (every page)

### Header

```
┌─────────────────────────────────────────────────────────────────┐
│ [W]  Workshop Portal                    [Dashboard] [Appointments] │
│      Garage — without opening Desk      [Job cards] [Inspections] [Desk] │
└─────────────────────────────────────────────────────────────────┘
```

| Element | Label / behavior |
|--------|------------------|
| Mark | Square “W” on rose→amber gradient |
| Title | **Workshop Portal** |
| Subtitle | **Garage — without opening Desk forms** |
| Nav | **Dashboard** → `/` · **Appointments** → `/appointments` · **Job cards** → `/job-cards` · **Inspections** → `/inspections` |
| External | **Desk** → link `/app` (full ERPNext Desk) |
| Active route | Nav item gets sky border/background highlight |

### Main & footer

| Region | Content |
|--------|---------|
| Main | `RouterView`, max width ~7xl, horizontal padding |
| Footer | **Signed in as {fullname}** or **Signed in as {username}**, else **Workshop Management** |

---

## Page 1 — Dashboard (`/`)

**File:** `frontend/src/views/DashboardView.vue`  
**Data:** `garage_business_dashboard.get_dashboard_data` (Frappe whitelisted method).

### Top strip

```
┌──────────────────────────────────────────────────────────────────┐
│ [CC] Garage dashboard          [+ New appointment] [Refresh]        │
│      Real-time operations      [Appointments page] [Job cards] [Inspections] │
└──────────────────────────────────────────────────────────────────┘
```

| Control | Label |
|---------|--------|
| Avatar | **CC** (gradient square) |
| Title | **Garage dashboard** |
| Tagline | **Real-time operations** |
| Primary | **+ New appointment** |
| Secondary | **Refresh** |
| Links | **Appointments page**, **Job cards**, **Inspections** (router links) |

### Desk shortcut row (6 links)

External `<a href="/app/...">` tiles (not router):

1. **Job cards** → `/app/job-card`  
2. **Appointments** → `/app/service-appointment`  
3. **Inspections** → `/app/vehicle-inspection`  
4. **Vehicles** → `/app/vehicle`  
5. **Customers** → `/app/customer`  
6. **Invoices** → `/app/sales-invoice`

### Error / loading

- Error: red bordered banner, message text.  
- Loading: **Loading dashboard…**

### KPI row (4 cards)

Dynamic values from server; labels are fixed:

| Card label | Value | Optional hint |
|------------|--------|----------------|
| **Today revenue** | currency | — |
| **Month revenue** | currency | — |
| **Outstanding** | currency | — |
| **Open jobs** | integer | **Ready to invoice: {n}** when provided |

### Row: Job status | Top services | Appointments

**Block A — Job status**

- Heading: **JOB STATUS** (small caps style)  
- Empty: **No job card data.**  
- Else: list of `{ status label }` + count + horizontal bar (rose→amber gradient).

**Block B — Top services (month)**

- Heading: **TOP SERVICES (MONTH)**  
- Empty: **No service data yet.**  
- Else: rows `{ item_name }` + `{ amount }` (currency).

**Block C — Appointments** (narrow column)

- Heading: **APPOINTMENTS**  
- Big number: today’s appointment count  
- Sub: **Today (count)**  
- Rows: **In progress** · **Upcoming** (counts)  
- **Month completion** + percentage (sky accent)  
- Subheading: **NEXT APPOINTMENTS**  
- List: customer (or id) + scheduled time; empty row **No upcoming appointments** / **—**

### Row: Appointment status mix | Revenue trend

**Appointment status mix**

- Heading: **APPOINTMENT STATUS MIX**  
- Empty: **No data.**  
- Else: up to 8 rows `{ status }` + `{ count }` (scroll if more).

**Revenue trend**

- Heading: **REVENUE TREND**  
- Date range subtitle: `{trendStart} — {trendEnd}`  
- SVG sparkline + area fill (sky).

### Row: Recent jobs | Top parts (month)

**Recent jobs**

- Heading: **RECENT JOBS**  
- Table columns (no header row in UI): link **{job card name}** (opens Desk `/app/job-card/...`) · **Customer** · pill **{status}**  
- Empty: **No recent jobs**

**Top parts (month)**

- Heading: **TOP PARTS (MONTH)**  
- Empty: **No parts data yet.**  
- Else: same pattern as top services (name + amount).

### Service appointments table (bottom)

```
┌──────────────────────────────────────────────────────────────────┐
│ SERVICE APPOINTMENTS                                              │
│ [+ New appointment]  [Today] [Upcoming]     hint text right      │
├──────────────┬────────────┬──────────────────┬──────────┤
│ Appointment  │ Customer   │ Scheduled start  │ Status   │
└──────────────┴────────────┴──────────────────┴──────────┘
```

| Control | Label / behavior |
|---------|------------------|
| Title | **SERVICE APPOINTMENTS** |
| Toggle | **Today** / **Upcoming** (filters by server “today” date) |
| Hint | **Server date: YYYY-MM-DD** (today mode) or **After YYYY-MM-DD** (upcoming) |
| Empty | **No appointments found** |

### Modal — New service appointment (Dashboard)

Overlay: dimmed backdrop, click-outside closes.

| Field | Label | Type / notes |
|-------|--------|----------------|
| Title | **New service appointment** | |
| Blurb | **Choose a customer, then one of their vehicles. Lists use your desk permissions.** | |
| | **Customer** | `<select>` · placeholder **Loading customers…** / **Select customer…** |
| | **Vehicle** | `<select>` · disabled until customer · dynamic placeholder from composable |
| Warning | **No vehicles for this customer. Add one in Desk → Vehicle.** | amber text |
| | **Scheduled start** | `datetime-local` |
| | **Scheduled end** | `datetime-local` |
| | **Advisor (optional)** | text · placeholder **User ID** |
| | **Remarks** | textarea, 2 rows |
| Errors | `pickerError` (amber), `saveError` (rose) | |
| Actions | **Cancel** · **Create** / **Saving…** | |

---

## Page 2 — Appointments (`/appointments`)

**File:** `frontend/src/views/AppointmentsView.vue`

### List view

```
┌─────────────────────────────────────────────────────────────┐
│ Service appointments                    [+ New appointment]   │
├──────┬──────────┬────────────┬─────────┬──────┤
│ ID   │ Customer │ Start      │ Status  │ Desk │
└──────┴──────────┴────────────┴─────────┴──────┘
```

- Row click → opens **detail drawer** (modal).  
- **Desk** column: link **Open** → Desk form (new tab).  
- Loading: **Loading…** · Empty: **No appointments**  
- List error: red banner.

### Modal — New appointment (same fields as Dashboard modal)

- Title: **New appointment** (slightly shorter title than Dashboard).  
- Same fields: Customer, Vehicle, Scheduled start/end, Advisor, Remarks, Cancel, Create.

### Drawer — Appointment detail

```
┌─────────────────────────────────────┐
│ Appointment                    [Close] │
│ {detailName}  [Open full form in Desk →] │
├─────────────────────────────────────┤
│ Status        {value}                │
│ Customer      {value}                │
│ Vehicle       {value}                │
│ Scheduled start / end                │
│ Advisor       {value}                │
│ Remarks       {multiline if set}     │
│ Inspection    {id or —}              │
│ Job card      {id or —}              │
├─────────────────────────────────────┤
│ Help: Actions match the Service      │
│ Appointment desk form (...)          │
├─────────────────────────────────────┤
│ [Conditional action buttons]         │
└─────────────────────────────────────┘
```

**Static help:** **Actions match the Service Appointment desk form (check-in, inspection, job card, complete).**

**Conditional primary actions**

| Condition | Button |
|-----------|--------|
| `status === 'Scheduled'` | **Check in** |
| `status === 'Checked-In'` && no inspection | **Create inspection** |
| `status === 'Checked-In'` && no job card | **Create job card** |
| `status === 'In Progress'` | **Mark complete** |

**Conditional links**

- If inspection: **View inspection in Desk**  
- If job card: **View job card in Desk**

**Errors:** `detailError`, `detailActionError` (red).

### Modal — Create job card (from appointment)

- Title: **Create job card**  
- Blurb: **Same as Desk: choose company and warehouse.**  
- **Company** `<select>`  
- **Warehouse** `<select>` (depends on company; placeholders **Loading…**, **Select company first…**, **Loading warehouses…**, **Select warehouse…**)  
- **Cancel** · **Create** / **Creating…**

---

## Page 3 — Job cards (`/job-cards`)

**File:** `frontend/src/views/JobCardsView.vue`

### List

- Title: **Job cards**  
- Subtitle: **Workflow matches Desk (Workshop Job Card). Use Desk for line edits and complex changes.**  
- Table: **ID** · **Customer** · **Vehicle** · **Status** · **Appointment** · **Desk** (**Open**)  
- Row click → detail drawer.  
- Empty: **No job cards** · Loading: **Loading…**

### Drawer — Job card detail (wider: max-w-2xl)

**Header:** **Job card** · mono id · **Open full form in Desk →** · **Close**

**Summary grid (key/value)**

| Label | Field |
|-------|--------|
| Status | |
| Company | |
| Warehouse | |
| Customer | |
| Vehicle | |
| Posting date | |
| Advisor | |
| Appointment | mono |
| Inspection | mono |
| Quotation | mono |
| Sales invoice | mono |
| Complaint | **Complaint** — `complaint_summary` if present (pre-wrap) |

**Service items** panel

- Title: **SERVICE ITEMS ({count})**  
- Table: **Item** · **Qty** · **Amount** · empty row **None**

**Part items** panel

- Title: **PART ITEMS ({count})**  
- Same columns · **None**

**Workflow** section

- Label: **Workflow**  
- Buttons: one per server transition — shows **{friendly action label}** + **→ {next_state}**  
  - Friendly labels map Frappe actions: e.g. **Check in**, **Record inspection**, **Submit estimate**, **Approve**, **Start work**, **Ready to invoice**, **Close**, **Cancel job** (see `WORKFLOW_ACTION_LABELS` in source).  
- If none: **No actions for your role, or workflow not active. Use Desk to advance status.**

**Create documents**

- Section label: **Create documents (same rules as Desk)**  
- **Create quotation** (when allowed)  
- **Create sales invoice** (when allowed)

**Linked records**

- Section label: **Linked records**  
- Links: **Appointment in Desk**, **Inspection in Desk**, **Quotation in Desk**, **Sales invoice in Desk** (only if values exist)

---

## Page 4 — Inspections (`/inspections`)

**File:** `frontend/src/views/InspectionsView.vue`  
**Deep link:** `/inspections?open={INSPECTION_ID}` opens the editor once, then clears query.

### List

- Title: **Vehicle inspections**  
- Subtitle: **Load the standard checklist, set status and notes per line, save. Create job card when ready (lines added in Desk).**  
- **+ New inspection**  
- Table: **ID** · **Appointment** · **Customer** · **Vehicle** · **Date** · **Desk** (**Open**)  
- Row click → **Inspection editor** (large modal).  
- Empty: **No inspections**

### Modal — Inspection editor (max-w-5xl)

**Toolbar**

- Title: **Inspection** · mono **{editName}** · link **Open in Desk →**  
- **Load standard checklist** · **Save** / **Saving…** · **Close**  
- Overlay click outside → close (same as Close behavior per implementation: `closeEditor` on backdrop)

**Body — meta grid**

| Label | Control |
|-------|---------|
| Appointment | disabled input |
| Customer | disabled input |
| Vehicle | disabled input |
| Inspection date | `date` input (editable) |
| Inspector (optional) | text, placeholder **User ID** |
| Links | **Appointment** · **Job card** (text links to Desk when set) |

**Banner (when no job card)**

- Button: **Create job card from inspection**  
- Hint: **Uses Desk logic (company, warehouse). Add service/parts on the job card in Desk.**

**Checklist table** (scroll ~50vh)

| Column | Content |
|--------|---------|
| Section | `<select>` — fixed options (see below) |
| Check item | text input, placeholder **Check item** |
| Status | Row: **[OK]** **[Report]** quick buttons + full **status** `<select>` |
| Notes | textarea 2 rows |
| (actions) | **Remove** |

**Status dropdown options (exact strings):**  
`OK`, `Good`, `Fair`, `Worn`, `Needs Attention`, `Critical`, `N/A`

**Quick buttons:** **OK** → sets `OK` · **Report** → sets `Needs Attention` (tooltips: Mark OK / Needs attention)

**Section dropdown options (exact strings):**

- Engine & Fluids  
- Braking System  
- Tires & Wheels  
- Battery & Electrical  
- Suspension & Steering  
- Exterior & Interior  

**Below table:** **+ Add blank line** (text button)

**Empty table message:** **No lines — use “Load standard checklist” or add rows in Desk.**

**Footer strip:** `editorBanner` (amber styled) for success messages.

### Modal — New inspection

- Title: **New inspection**  
- Blurb: **Choose a checked-in appointment without an inspection yet.**  
- Single `<select>` of appointments (option text: `{name} — {customer} ({vehicle})`)  
- **Cancel** · **Create** / **Creating…**

### Modal — Create job card (from inspection)

- Title: **Create job card**  
- Blurb: **Company and warehouse (same as Desk). Service and part lines are added on the job card.**  
- **Company** · **Warehouse** (same pattern as Appointments job card modal)  
- **Cancel** · **Create** / **Creating…**

---

## Cross-cutting UX patterns

| Pattern | Where used |
|---------|------------|
| Error banner | Red border, light red background, all list pages + modals |
| Loading row | Full-width table cell **Loading…** |
| Empty row | Centered muted message |
| Modals | `Teleport to="body"`, z-index 50–65 depending on stack |
| Desk links | **Open**, **Open in Desk →**, open in new tab |
| Status pills | Rounded; colors vary by status (sky / emerald / rose / slate) |

---

## Out of scope for this portal (Desk only)

- Editing full Job Card line grids, taxes, pricing rules beyond what API exposes.  
- Vehicle Inspection **recommended parts / estimated price** (hidden on portal; cleared on save).  
- Populating job card lines from inspection recommendations: portal passes **populate_from_recommendations: 0** for inspection-originated job cards.

---

## File map (for engineers pairing with design)

| Route | Vue file |
|-------|----------|
| `/` | `frontend/src/views/DashboardView.vue` |
| `/appointments` | `frontend/src/views/AppointmentsView.vue` |
| `/job-cards` | `frontend/src/views/JobCardsView.vue` |
| `/inspections` | `frontend/src/views/InspectionsView.vue` |
| Shell | `frontend/src/App.vue` |
| Routes | `frontend/src/router.js` |
| API helpers | `frontend/src/utils/api.js` |
| Customer/vehicle pickers | `frontend/src/composables/useCustomerVehicleSelects.js` |

---

*Generated from codebase snapshot for UI redesign handoff.*
