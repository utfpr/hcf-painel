# Herbarium UI/UX Redesign Specification

## Users List — Reference Redesign

**Status:** Implementation specification  
**Frontend:** React + Ant Design 6  
**Initial scope:** Users List  
**Design direction:** Modern professional SaaS, minimal, information-dense  
**Primary references:** Linear, GitHub  
**Priority:** Modern appearance → faster workflows → clearer navigation  
**Constraint:** Prefer native Ant Design components and theme tokens over custom components.

---

# 1. Product Context

The application manages a **herbarium collection** and is used by different types of users, including:

- Administrators
- Collection curators
- Researchers
- Students
- External users

Example roles can include:

- Administrator
- Curator
- Researcher
- Student
- External

The exact role model is not important for this redesign. The interface must simply support multiple user types cleanly.

The existing application structure should be preserved where reasonable. This is an **evolution of the current UI**, not a complete product redesign.

The Users List will be the first redesigned screen and should establish patterns that can later be reused throughout the application.

---

# 2. Current UX Problems

The redesign must specifically address:

1. Navigation feels difficult.
2. Forms are confusing.
3. The application looks visually outdated.
4. Filters occupy too much space.
5. Primary and secondary actions do not have enough visual hierarchy.
6. Large containers create unused whitespace.
7. Destructive actions are visually too prominent.
8. The interface does not adapt well to mobile usage.
9. The current application shell uses the institutional green too heavily.
10. The header contains several independent controls that could be simplified.

---

# 3. Design Goals

The redesigned interface must feel:

- Modern
- Professional
- Minimal
- Fast
- Dense without feeling crowded
- Consistent
- Familiar to users of modern administrative applications

The UI should borrow principles from Linear and GitHub rather than attempt to visually copy either product.

In particular:

- neutral surfaces;
- restrained use of color;
- clear typography hierarchy;
- compact controls;
- subtle borders;
- minimal shadows;
- contextual actions;
- predictable navigation;
- content taking priority over decorative containers.

---

# 4. Core Design Principle

## Content First

The table is the main object of the Users screen.

Do not surround every section with large cards.

The hierarchy should primarily be created through:

- spacing;
- typography;
- borders;
- background contrast;
- alignment.

Avoid excessive:

- card nesting;
- shadows;
- oversized headers;
- whitespace;
- decorative UI.

---

# 5. Proposed Desktop Layout

The general structure should be:

```text
┌───────────────┬──────────────────────────────────────────────────────┐
│               │ Top application bar                                  │
│               ├──────────────────────────────────────────────────────┤
│               │                                                      │
│   Sidebar     │ Users                              [+ Add user]      │
│               │ Manage herbarium users                              │
│               │                                                      │
│               │ [ Search users... ] [Role ▼] [Filters] [Columns]   │
│               │                                                      │
│               │ ┌──────────────────────────────────────────────────┐ │
│               │ │ Name │ Type │ Email │ Phone │ Created │   ⋯    │ │
│               │ ├──────────────────────────────────────────────────┤ │
│               │ │ ...                                              │ │
│               │ │ ...                                              │ │
│               │ │ ...                                              │ │
│               │ └──────────────────────────────────────────────────┘ │
│               │                                      Pagination     │
│               │                                                      │
└───────────────┴──────────────────────────────────────────────────────┘
```

The current large **Search user** card should be removed.

---

# 6. Application Shell

Although the initial implementation focuses on Users, the shell should already establish the new design language.

## 6.1 Sidebar

Keep the left sidebar.

### Expanded width

Approximately:

`232–248px`

Recommended default:

`240px`

### Collapsed width

Approximately:

`64–72px`

### Appearance

Do **not** use saturated green as the full sidebar background.

Instead use a neutral sidebar.

Light mode example:

```text
Sidebar:          #F7F8FA
Main background:  #F5F6F8
Content:          #FFFFFF
```

Dark mode should use equivalent Ant Design dark-theme surfaces rather than independently hard-coded versions of every color.

Institutional green becomes the primary accent color.

Use green for:

- logo accents;
- selected navigation;
- primary actions;
- links where appropriate;
- focus/accent states;
- small brand details.

This preserves UTFPR identity without making the application feel visually heavy.

---

# 7. Logo

The UTFPR logo is mandatory.

Keep it at the top of the sidebar.

The logo area should have approximately:

`64–72px` height.

Do not make the logo disproportionately large.

When the sidebar collapses:

- show a simplified logo/icon if available;
- otherwise maintain an appropriately scaled UTFPR mark.

---

# 8. Navigation Organization

The sidebar may be reorganized without changing routes.

Suggested grouping:

## Collection

- Accessions
- Taxonomy
- Identifiers
- Collectors
- Herbaria
- Records

## People & Access

- Users

## Geography

- Locations
- Geolocation

## Data & Operations

- Reports
- Export
- Services
- RFID

The final placement of Services and RFID can be adjusted after reviewing those modules.

Do not place **Log Out** as a permanent main-navigation item.

Logout belongs in the account menu.

---

# 9. Sidebar Navigation Behavior

Selected navigation should use:

- subtle green-tinted background;
- green foreground/icon;
- medium font weight.

Avoid a large saturated rectangle across the entire sidebar.

Hover should use a subtle neutral or lightly tinted background.

Navigation icons should remain visible because they improve scanning.

Collapsed sidebar:

- icons only;
- tooltip on hover;
- active state remains clearly visible.

On mobile, the sidebar becomes an overlay Drawer opened through the menu button.

---

# 10. Top Application Bar

Recommended height:

`56px`

The current header should be simplified.

## Left

- mobile/sidebar toggle when necessary;
- optional breadcrumb.

## Environment

The current large:

`Ambiente de DESENVOLVIMENTO`

element should become a compact badge/tag such as:

`Development`

It should remain clearly visible but should not dominate the navigation.

Possible semantic treatments:

- Development → blue/neutral badge
- Staging → orange badge
- Production → no badge or subtle production indicator

## Right

Display:

- language control;
- appearance/theme control;
- user avatar;
- user name on larger screens.

Clicking the user area opens a menu containing:

- Profile
- Log out

Remove the current separate **Profile** and **Log Out** buttons.

---

# 11. Theme Selection

The application supports three appearance states:

- System
- Light
- Dark

Default:

`System`

The System option follows the user's operating-system preference.

A manual Light or Dark selection overrides the operating-system preference.

Persist the preference locally or in the user's account preferences.

Do not provide only a binary Light/Dark switch because that removes the System option.

Recommended control:

```text
☀ / ☾ appearance icon
        ↓
System
Light
Dark
```

---

# 12. Main Content Area

The main content should use substantially more of the available screen.

Desktop page padding:

`24px`

Large desktop:

up to `32px` if appropriate.

Mobile:

`16px`

Avoid unnecessarily restricting the content with a narrow `max-width`.

Herbarium management tables benefit from horizontal space.

---

# 13. Users Page Header

Replace:

`Users list`

with:

# Users

Optional secondary text:

`Manage users and access to the herbarium.`

Do not make the subtitle overly prominent.

Right side:

**+ Add user**

The Add User button is the only primary action in the page header.

---

# 14. Add User

Clicking **Add user** should open a Drawer.

Reasoning:

The form contains approximately 6–10 fields and does not require enough complexity to justify leaving the list.

Recommended desktop Drawer width:

approximately `480–560px`.

The exact width can adapt to the form.

On mobile:

the Drawer should use the full available screen width.

Example structure:

```text
Add user                         ×
──────────────────────────────────

Name
[                              ]

Email
[                              ]

Phone
[                              ]

Role
[                              ]

Institution
[                              ]

...

──────────────────────────────────
                    Cancel  Create
```

Use a single-column layout unless two fields have a very strong semantic relationship.

Primary action:

**Create user**

Secondary action:

**Cancel**

Validation errors should appear beside or below their fields.

Do not clear the Drawer if submission fails.

After successful creation:

1. close Drawer;
2. show success feedback;
3. refresh the list;
4. display the newly created user if compatible with current filters.

---

# 15. Edit User

Editing remains a dedicated page.

Clicking anywhere on a normal table row opens that user's edit page.

Use:

`cursor: pointer`

for clickable rows.

Interactive elements inside the row must not trigger row navigation.

Examples:

- email link;
- overflow menu;
- buttons;
- checkboxes if added later.

---

# 16. Search and Filter Toolbar

The existing large search form should be replaced by a compact toolbar.

Desktop example:

```text
[ 🔍 Search users...                    ] [ Role ▾ ] [ Filters 2 ] [Columns]
```

The Add User action remains in the page header instead of inside the filter toolbar.

## Search

One search field replaces:

- Name
- Email
- Phone

Placeholder:

`Search by name, email or phone`

Search should query those fields simultaneously.

Support:

- pressing Enter;
- clicking the search icon/button;
- clearing the search.

Avoid requiring users to know which field contains the information they are looking for.

---

# 17. Primary Role Filter

Role/Type is the most frequently useful structured filter and remains directly visible beside Search.

Example:

```text
Role
All roles
Administrator
Curator
Researcher
Student
External
```

Use the terminology already established by the product.

If the database uses `type`, it does not require the UI label to say `Type` if `Role` is clearer to users.

---

# 18. Advanced Filters

Clicking **Filters** opens a compact filtering panel.

Desktop:

use a Popover/Dropdown-style panel.

Mobile:

use a bottom or side Drawer.

Filters for the initial version:

### Institution

Searchable/selectable institution.

### Creation date

Date range:

```text
From → To
```

### Role

Role can remain visible in the toolbar and does not need to be duplicated in the advanced panel.

The Filter button should display the number of active advanced filters.

Example:

`Filters 2`

or a small badge.

Panel actions:

- Reset
- Apply

If no advanced filter is active, do not display a count.

---

# 19. Active Filter Visibility

Users must be able to understand why records are missing.

If advanced filters are active, optionally show compact removable filter chips below the toolbar.

Example:

```text
Institution: UTFPR ×    Created: Jan 2026 – Aug 2026 ×
```

Do not show chips for simple keyword search.

Avoid chips if they make the interface unnecessarily tall when no filters are active.

---

# 20. Column Visibility

Provide a **Columns** control at the right side of the table toolbar.

Recommended icon:

settings/table-columns style icon.

Click opens a compact panel containing:

```text
Columns

✓ Name
✓ Type
✓ E-mail
✓ Phone
✓ Creation date

Reset to default
```

Name should preferably remain mandatory.

The Actions column should always remain available.

Column preferences should persist between sessions.

If account-level preferences already exist, persist there.

Otherwise local browser storage is sufficient for the first implementation.

---

# 21. Users Table

Default columns:

1. Name
2. Type
3. E-mail
4. Phone
5. Creation date
6. Actions

The existing columns are sufficient.

---

# 22. Table Density

Prioritize information density.

Target table row height:

approximately `40–44px`.

Use compact/medium Ant Design control sizing.

Avoid excessively tall SaaS-style rows.

Headers should be visually clear but not oversized.

Recommended typography:

```text
Table header: 12–13px / medium
Table body:   14px / regular
```

Use tabular alignment where appropriate.

---

# 23. Table Styling

Prefer:

- white/light content surface;
- subtle borders;
- restrained header background;
- row hover state;
- minimal or no shadow.

Avoid:

- strong zebra stripes;
- large shadows;
- thick borders;
- oversized rounded table containers.

Suggested radius for outer table/container:

`8px`

The table should visually feel like one surface rather than a card inside another card.

---

# 24. Table Sorting

Support sorting for useful columns.

Initial recommendation:

- Name
- Type
- E-mail
- Creation date

Creation date should support ascending and descending sorting.

Do not add sorting merely because technically possible. Phone does not need sorting.

Sorting state should be visually visible in the column header.

If the application uses server pagination, sorting should also happen server-side.

---

# 25. Row Hover

Hovering a row should:

- slightly change its background;
- show pointer cursor;
- make it clear that the row is clickable.

Do not use dramatic animation.

Transition should feel nearly immediate.

Approximately:

`100–150ms`

is sufficient for subtle UI state changes.

---

# 26. Actions Column

Replace the permanently visible yellow Edit and red Delete icons with a single overflow control:

`⋯`

Menu:

```text
Edit
Delete
```

Edit navigates to the same page as clicking the row.

Keeping Edit in the menu improves discoverability even though the entire row is clickable.

Delete is styled as destructive.

This greatly reduces visual noise in a data-dense table.

---

# 27. Delete Confirmation

Deletion is permanent.

Never delete immediately after the menu action.

Show a confirmation Modal.

Example:

```text
Delete user?

Are you sure you want to permanently delete
“Greta Aline Dettke”?

This action cannot be undone.

Cancel                      Delete
```

The final Delete button uses danger styling.

After successful deletion:

- close Modal;
- display success feedback;
- update the table without requiring a full browser refresh.

---

# 28. Pagination

Pagination remains below the table.

Desktop:

```text
1–20 of 128 users                       < 1 2 3 ... 7 >   20 / page
```

If total-record information already exists, display it.

Page-size options could include:

- 20
- 50
- 100

Default:

`20`

If the user changes page size, persist it.

Keep pagination compact.

---

# 29. Empty State

Do not render a blank table.

Two empty states are required.

## No users exist

```text
No users yet

Add the first user to the herbarium.

[ Add user ]
```

## Search/filter returned nothing

```text
No users found

Try changing your search or filters.

[ Clear filters ]
```

These are different states and should have different calls to action.

---

# 30. Loading State

Avoid blocking the entire application shell.

When refreshing the user list:

- keep the page structure visible;
- show table loading state/skeleton/spinner;
- avoid layout shifts.

When applying filters, do not clear the existing table before the request completes if that creates visual flicker.

---

# 31. Error State

If users cannot be loaded:

```text
Unable to load users.

Something went wrong while retrieving the user list.

[ Try again ]
```

Do not expose raw server errors to end users.

Errors useful for developers may still be logged separately.

---

# 32. Mobile Layout

Target mobile devices as first-class supported clients, but maintain a denser desktop experience.

At widths below approximately `768px`:

- sidebar becomes a Drawer;
- page padding becomes 16px;
- header controls simplify;
- filters reorganize vertically;
- table becomes simplified.

---

# 33. Mobile Page Header

Example:

```text
Users                    [+ Add]
Manage users
```

The Add button can shorten from:

`Add user`

to:

`Add`

when space is limited.

---

# 34. Mobile Filters

Search becomes full width.

Example:

```text
[ 🔍 Search users...             ]

[ Role ▾ ] [ Filters ] [Columns]
```

If space becomes too narrow:

```text
[ 🔍 Search users...             ]

[ Filters ]       [Columns]
```

Move Role into Filters on very small screens.

---

# 35. Mobile User Table

Do not use the full six-column desktop table with horizontal scrolling as the default experience.

Use a simplified table/list.

Recommended presentation:

```text
Name / Email                    Role      ⋯
──────────────────────────────────────────
Greta Aline Dettke             Curator   ⋯
greta.aline@gmail.com

Tatiane                         Curator   ⋯
tatiane@utfpr.edu.br
```

Visible information:

- Name
- Email as secondary text
- Role
- Actions

Hide by default:

- Phone
- Creation date

Clicking the row still opens Edit User.

This retains useful context without requiring horizontal scrolling.

---

# 36. Mobile Add User

Add User Drawer becomes effectively full screen.

Header remains visible:

```text
← Add user
```

Actions should remain easily reachable.

If the form becomes taller than the viewport, the content scrolls while the action area may remain sticky.

---

# 37. Typography

Prefer the default/system-oriented Ant Design typography unless the application already has a required institutional font.

Do not add a custom web font solely for visual modernization.

Suggested hierarchy:

```text
Page title       24px / semibold
Section title    16px / semibold
Body             14px / regular
Secondary        13px / regular
Table header     12–13px / medium
Caption          12px / regular
```

Avoid excessive font-weight variation.

---

# 38. Spacing System

Use a predictable spacing scale.

Primary spacing values:

```text
4px
8px
12px
16px
24px
32px
```

Examples:

Page edge → content:

`24px desktop`

Page title → toolbar:

`20–24px`

Toolbar → table:

`12–16px`

Form field spacing:

`16px`

Avoid arbitrary spacing such as 17px, 27px, 31px unless necessary.

---

# 39. Border Radius

Use restrained rounding.

Recommended:

```text
Small controls       6px
Inputs/buttons       6–8px
Panels               8px
Large overlays       10–12px
```

Avoid the highly rounded/pill-shaped aesthetic for normal form controls.

Pills are acceptable for:

- statuses;
- tags;
- small badges.

---

# 40. Brand Color

Retain UTFPR/institutional green as the brand identity.

Suggested starting primary seed:

```text
#0F7A3F
```

The exact green should be adjusted against the institution's official branding if an official digital palette exists.

The goal is not to change the brand to a different color.

The goal is to **reduce the amount of green used at once**.

Use green strategically instead of using it as a large background.

---

# 41. Secondary Accent

The existing gold/yellow should not compete with green as another primary action color.

Gold may remain for semantic or institutional purposes, but:

Primary action:

`Green`

Secondary actions:

`Neutral`

Danger:

`Red`

Information:

Ant Design semantic blue where appropriate.

Avoid arbitrary button colors.

---

# 42. Light Theme

Conceptual hierarchy:

```text
App background     light neutral gray
Sidebar            light neutral gray
Header             white / neutral surface
Content surface    white
Border             subtle gray
Primary text       near-black
Secondary text     gray
Accent             UTFPR green
```

Do not hard-code every derived shade.

Prefer Ant Design design tokens.

---

# 43. Dark Theme

Dark mode must be a real theme rather than simply replacing white with black.

Use Ant Design's dark theme algorithm as the foundation.

Maintain:

- neutral dark backgrounds;
- readable text hierarchy;
- subtle surface differentiation;
- green brand accents.

Avoid highly saturated green surfaces in dark mode.

Primary green buttons must maintain readable foreground contrast.

---

# 44. Ant Design Theme Strategy

Create the theme centrally through `ConfigProvider`.

Prefer global tokens over scattered CSS overrides.

Conceptual structure:

```tsx
<ConfigProvider
  theme={{
    algorithm: appearanceAlgorithm,
    token: {
      colorPrimary: brandGreen,
      borderRadius: 8,
      fontSize: 14,
    },
  }}
>
  <App />
</ConfigProvider>
```

Do not create separate manually maintained CSS themes for Light and Dark unless a specific requirement cannot be implemented with Ant Design theming.

---

# 45. Ant Design Component Mapping

Prefer existing Ant Design components.

Application shell:

- `Layout`
- `Sider`
- `Menu`

Page composition:

- `Flex`
- `Space`
- `Typography`

Filters:

- `Input` / `Input.Search`
- `Select`
- `DatePicker.RangePicker`
- `Popover` or `Dropdown`
- `Badge`

Actions:

- `Button`
- `Dropdown`

Data:

- `Table`
- `Pagination`

Creation:

- `Drawer`
- `Form`
- `Input`
- `Select`

Feedback:

- `Modal`
- `App` message/notification APIs
- `Skeleton` / component loading state
- `Empty`

User navigation:

- `Avatar`
- `Dropdown`

Use custom components primarily to compose Ant Design primitives, not replace them.

---

# 46. Internationalization

The UI must support:

- English
- Portuguese

All new visible strings must use the application's translation system.

Do not hard-code:

```tsx
<Button>Add user</Button>
```

Prefer:

```tsx
<Button>{t('users.actions.add')}</Button>
```

Example key structure:

```text
users.title
users.description

users.search.placeholder

users.filters.role
users.filters.institution
users.filters.creationDate
users.filters.apply
users.filters.reset

users.columns.name
users.columns.type
users.columns.email
users.columns.phone
users.columns.creationDate

users.actions.add
users.actions.edit
users.actions.delete

users.delete.title
users.delete.description
```

Layouts must tolerate Portuguese labels being longer than English labels.

Do not design buttons with fixed widths based on English text.

---

# 47. Navigation Translation

Menu names must also use translation keys.

Avoid abbreviations simply because translated strings are longer.

If necessary:

- sidebar remains 240px;
- long items use ellipsis;
- tooltip reveals complete label.

---

# 48. Basic Accessibility

Formal WCAG compliance is not currently a project requirement, but normal accessibility practices should still be followed.

At minimum:

- keyboard-accessible controls;
- visible focus states;
- tooltips for icon-only actions;
- sufficient text contrast;
- do not communicate information using color alone;
- buttons must have understandable accessible names;
- clickable table rows must also allow keyboard navigation where practical.

Do not remove Ant Design focus states for visual reasons.

---

# 49. Interaction Rules

Use predictable behavior across the page.

### Primary action

Only one visually dominant action should normally exist within each context.

Page:

`Add user`

Drawer:

`Create user`

Modal:

`Delete`

### Secondary actions

Use default/neutral buttons.

### Destructive actions

Use red only when the user reaches the destructive action or confirmation.

Do not permanently display red icons throughout every table row.

---

# 50. URL and State Behavior

Whenever possible, list state should be representable in the URL.

Examples:

```text
/users?q=marcelo
/users?role=curator
/users?page=2
/users?sort=createdAt&order=desc
```

This is particularly useful for:

- browser Back;
- browser Forward;
- bookmarking;
- sharing filtered views;
- restoring state after visiting Edit User.

When the user:

1. filters Users;
2. opens a user;
3. edits the user;
4. returns to the list;

their previous:

- search;
- filters;
- page;
- sorting

should remain intact.

This is an important workflow improvement.

---

# 51. Recommended Desktop Screen

The final Users screen should visually approximate this structure:

```text
Users                                                   + Add user
Manage users and access to the herbarium

[ Search by name, email or phone... ] [Role ▾] [Filters] [Columns]

4 users

┌───────────────────────────────────────────────────────────────────────────┐
│ Name ▲             Type       E-mail              Phone       Created   ⋯ │
├───────────────────────────────────────────────────────────────────────────┤
│ Greta Aline Dettke Curator    greta...@gmail.com  +55 ...     Aug 08    ⋯ │
│ Tatiane             Curator    tatiane@utfpr...                Aug 08    ⋯ │
│ Marcelo             Curator    mcaxambu@utfpr...                Aug 08    ⋯ │
│ Edvaldo Szymonek    Curator    edvaldoszy@gmail...              Aug 08    ⋯ │
└───────────────────────────────────────────────────────────────────────────┘

1–4 of 4 users                                      ‹ 1 ›     20 / page
```

Notice what is intentionally absent:

- no large Search card;
- no unnecessary section container;
- no permanent Edit icon;
- no permanent Delete icon;
- no giant Add button;
- no saturated green sidebar;
- no duplicated Log Out action.

---

# 52. Visual Relationship to Existing Screen

The redesign should still be recognizable as the same application.

Keep:

- left navigation;
- top header;
- page title;
- filter area;
- table;
- pagination;
- institutional branding;
- general route structure.

Change:

- colors;
- density;
- spacing;
- hierarchy;
- filter presentation;
- table interactions;
- navigation grouping;
- account controls;
- theme behavior;
- mobile presentation.

This satisfies the requirement to be conservative while substantially modernizing the product.

---

# 53. Component Architecture

Suggested component decomposition:

```text
AppShell
├── AppSidebar
├── AppHeader
├── PageContent
│
└── UsersPage
    ├── UsersPageHeader
    ├── UsersToolbar
    │   ├── UserSearch
    │   ├── RoleFilter
    │   ├── AdvancedFilters
    │   └── ColumnSettings
    │
    ├── ActiveFilters
    ├── UsersTable
    ├── UsersPagination
    ├── AddUserDrawer
    └── DeleteUserModal
```

Avoid excessive abstraction.

A wrapper component should exist only when it:

- encapsulates reusable behavior;
- provides meaningful semantic structure;
- or will be reused across multiple screens.

---

# 54. Reusable Patterns Established by This Screen

The Users redesign should establish patterns later reusable by:

- Accessions
- Taxonomy
- Locations
- Collectors
- Herbaria
- Records
- Reports

Specifically create reusable patterns for:

### `PageHeader`

Title + description + primary action.

### `ListToolbar`

Search + common filters + advanced filters + view options.

### `DataTable`

Standard density, sorting, row actions and pagination.

### `EntityDrawer`

Creation of smaller entities.

### `ColumnSettings`

Reusable column visibility configuration.

This allows future screens to be modernized without creating a different interaction model for every module.

---

# 55. Implementation Rules

## Prefer Ant Design

Before creating custom UI, determine whether Ant Design already provides the required component.

## Prefer theme tokens

Do not scatter colors such as:

```css
color: #008000;
background: #f5f5f5;
```

through components.

Use theme tokens or application semantic tokens.

## Avoid `!important`

Do not build the redesign around large sets of `!important` overrides.

## Keep DOM semantic

Do not turn every UI object into a clickable `div`.

## Keep responsive logic centralized

Use common breakpoints and shared layout logic instead of component-specific arbitrary widths.

---

# 56. Suggested Design Tokens

Create application semantic tokens layered on top of Ant Design tokens.

Example:

```ts
const herbariumTheme = {
  brand: {
    primary: '#0F7A3F',
  },

  layout: {
    sidebarWidth: 240,
    sidebarCollapsedWidth: 68,
    headerHeight: 56,
    pagePaddingDesktop: 24,
    pagePaddingMobile: 16,
  },

  table: {
    rowHeight: 42,
  },
};
```

Do not duplicate Ant Design tokens unnecessarily.

For example, use Ant Design's normal border, text and surface tokens rather than creating custom equivalents for every color.

---

# 57. Phase 1 Implementation Scope

Implement:

- neutral sidebar styling;
- improved sidebar active state;
- simplified application header;
- account dropdown;
- System/Light/Dark theme control;
- Users page header;
- compact search;
- Role filter;
- Advanced Filters;
- column chooser;
- redesigned table;
- sortable columns;
- clickable rows;
- overflow actions;
- delete confirmation;
- pagination;
- Add User Drawer;
- loading/empty/error states;
- mobile simplified users table;
- translations for all new UI.

Do not redesign every other module during Phase 1.

They may continue using their existing screens inside the new application shell until migrated.

---

# 58. Phase 1 Non-Goals

Do not:

- rebuild the backend;
- change user permissions;
- change database models;
- redesign the Edit User form unless necessary for shell compatibility;
- introduce a new UI library;
- replace Ant Design;
- create a custom design-system package;
- redesign every herbarium module simultaneously;
- radically change route structure.

---

# 59. Acceptance Criteria

The Users redesign is complete when all of the following are true:

## Application shell

- [ ] UTFPR logo remains present.
- [ ] Sidebar uses a neutral surface rather than solid saturated green.
- [ ] Green remains the primary brand color.
- [ ] Sidebar can collapse on desktop.
- [ ] Sidebar becomes an overlay on mobile.
- [ ] Navigation is grouped logically.
- [ ] Logout is available through the account menu.
- [ ] Header is approximately 56px high.
- [ ] Development environment indicator is compact.

## Theme

- [ ] System appearance is the default.
- [ ] User can manually select Light.
- [ ] User can manually select Dark.
- [ ] Appearance preference persists.
- [ ] Dark mode uses Ant Design theming rather than a separately duplicated CSS theme.

## Users header

- [ ] Page title is `Users`.
- [ ] Add User is the primary page action.
- [ ] Add User opens a Drawer.
- [ ] Edit User remains a dedicated route.

## Search

- [ ] One input searches name, email and phone.
- [ ] Individual Name/Email/Phone search inputs have been removed.
- [ ] Role is available as a quick filter.
- [ ] Advanced Filters contains Institution and Creation Date.
- [ ] Active filters can easily be cleared.

## Table

- [ ] Default columns remain Name, Type, E-mail, Phone and Creation Date.
- [ ] Rows are approximately 40–44px high.
- [ ] Useful columns support sorting.
- [ ] User can choose visible columns.
- [ ] Column preferences persist.
- [ ] Clicking a row opens Edit User.
- [ ] Row hover makes clickability clear.
- [ ] Action column uses an overflow menu.
- [ ] Delete requires confirmation.
- [ ] Pagination is compact.
- [ ] Page size can be selected.

## State

- [ ] Loading state exists.
- [ ] Empty database state exists.
- [ ] No-search-results state exists.
- [ ] Error state exists.
- [ ] Successful creation provides feedback.
- [ ] Successful deletion provides feedback.

## Responsive behavior

- [ ] Page works on desktop.
- [ ] Page works on mobile.
- [ ] Desktop table remains information-dense.
- [ ] Mobile table does not require six-column horizontal scrolling.
- [ ] Mobile rows show Name, Email and Role.
- [ ] Add User Drawer works as a full-width mobile experience.

## Internationalization

- [ ] All new text uses translation keys.
- [ ] English is supported.
- [ ] Portuguese is supported.
- [ ] Components tolerate longer translations.

---

# 60. Definition of Success

The redesign should not make users think:

> “This is a completely different system.”

It should make them think:

> “This is the same herbarium system, but cleaner, faster and much more modern.”

The strongest visual change should come from **removing unnecessary UI**, not adding more decoration.

The Users List should become the reference implementation for the rest of the herbarium application.