# DESIGN.md: API Explorer UI

The spec for the UI redesign. Code must match the mocks and this file. Nothing beyond it.

## Sources of truth
- **Mocks:** `design/mocks/*.png`, one per screen, light and dark. Live canvas (Claude Design): https://claude.ai/artifact/Qje8Nm3KR5tySFhsceC8HC
- **Direction:** A (`Main`). `DirectionB` was not chosen and is kept for reference only.
- **Mock source:** `design/mocks/*.dc.html` are Claude Design files (`{{holes}}`, `<sc-for>`, `<sc-if>`). They are not plain HTML. Read them for exact CSS values, never copy them into `src/`.
- **Colors and sizes:** `src/styles/tokens.css`. No hex values anywhere else.
- If a mock and this file disagree, this file wins. If something is in neither, ask Matt. Don't invent it.

| Screen | Mock | What it shows |
|---|---|---|
| 1 | `Main` | Power Platform, sample response, Body tab, rail open |
| 2 | `Screen2-Dataverse` | Dataverse, live 200 with formatted values, Params tab |
| 3 | `Screen3-SharePoint` | SharePoint, sample only, Send off, Code tab (curl) |
| 4 | `Screen4-States` | First open, loading, error, Production confirm |

## Hard constraints
- Runs in a PPTB tab (Electron webview). PPTB draws the window chrome: no app header, logo or title.
- Vanilla TypeScript + CSS, one IIFE bundle. No React, no Fluent UI library, no web fonts, no CDNs.
- Light and dark follow PPTB: `toolboxAPI.utils.getCurrentTheme()` returns `'light'` or `'dark'`, set on `<html data-theme>`, and kept in sync on theme change.
- No browser dialogs (`prompt`, `confirm`, `alert`). Confirmations are inline bars or rows. Toasts come from `toolboxAPI.utils.showNotification`.
- Icons: inline SVG only (list below).
- Desktop only, window width 900 to 1600 px.
- Power Platform calls return the body only. Never fake a status code or headers: show "OK (body only)".
- No Prettier. ESLint for correctness only.

## Layout (the shell)
```
+-------------------------------------------------------------------------------+
| Top bar 40px: [Dataverse][Power Platform][SharePoint Sample data]   Connection [select] (env) |
+--------------+------------------------------------------------+---------------+
| Sidebar      | Request: URL row, sub-tabs, editor (236px)     | Rail 300px    |
| 272px        +------------------------------------------------+ (40px when    |
| Endpoints /  | Response: status bar, tabs, body (fills rest)  |  collapsed)   |
| History /    |                                                |               |
| Saved        |                                                |               |
+--------------+------------------------------------------------+---------------+
```
- Root: column flex, full height. Top bar fixed 40px, border-bottom `--stroke`.
- Body: CSS grid `var(--side-w) minmax(0, 1fr) var(--rail-w)`. Collapsed rail: `var(--rail-w-collapsed)`.
- Sidebar and rail use `--bg2` with a `--stroke` border on the inner side. Main uses `--bg`.
- Request section: border-bottom `--stroke`. Editor area fixed `--req-editor-h`, `--bg2`, scrolls.
- Response section fills the rest and scrolls inside its body only.

## Components
Values are from the mock CSS. Sizes in px.

**API tabs (top bar).** Buttons 40 high, padding 0 12, `--fg2`. Active: `--fg1`, weight 600, 3px `--brand` underline inset 12 each side, radius 2. SharePoint carries a "Sample data" tag. Top bar padding 0 12 0 4, gap 16.

**Connection.** Label "Connection" (12px, `--fg3`) + field select (min-width 200) showing `Primary · <name>` / `Secondary · <name>`.

**Environment badge.** Pill 24 high, radius 12, border `--stroke2`, 12px `--fg2`: green dot (8px, `--ok`) + name + ` · <type>` in `--fg3`. Production: `--bad-bg` fill, `--bad-bd` border, `--bad` text, weight 600, warning icon instead of the dot, text `Production · <name>`.

**Tag.** 11px/16px, padding 0 6, radius 4. Sample: `--smp` on `--smp-bg`, border `--smp-bd`. Live: `--ok` family with a 6px dot before the text.

**Field** (inputs, selects). 28 high, border `--stroke2`, bottom border `--fg4`, radius 4, `--bg`, padding 0 8. Focus: 2px `--brand` outline, offset -1.

**Buttons.** 28 high, padding 0 12, radius 4, weight 600, border `--stroke2`, `--bg`, hover `--hover`. Primary: `--btn` fill, `--on-btn` text, hover `--btn-h`. Disabled: `--bg4` fill and border, `--fg4` text. Small: 24 high, padding 0 8, 12px, weight 400. Danger: `--bad` fill, `--on-danger` text. Icon button: 24x24, no border, `--fg3`, hover `--bg4` + `--fg1`, needs `aria-label`.

**Segmented control** (Endpoints / History / Saved). Track `--bg4`, padding 2, radius 6, margin 8 8 6. Buttons 24 high, equal width. Active: `--bg`, `--fg1`, weight 600, `--shadow-seg`.

**Search field.** Field style, margin 0 8 6, search icon then a borderless input. Placeholder per API ("Search endpoints", "Search SharePoint endpoints").

**Sidebar group.** Full-width button: chevron (12px, rotates 90deg when open), name 14px/20px weight 600 `--fg2`, count right-aligned 11px `--fg3`. Padding 8 8 4, hover `--hover`. All groups open when a search is active.

**Sidebar item.** Button, padding 5 8, gap 8, radius 4. Method badge, then title (ellipsis) over the path (mono 11px/16px, `--fg4`, ellipsis). `title` attribute = full path. Hover `--hover`. Selected: `--sel` + 3px `--brand` bar on the left (top/bottom inset 8).

**Method badge.** 46x18, radius 3, 10px weight 700, letter-spacing .03em, centered. Color `--m<METHOD>` on `--m<METHOD>b`. The method select in the URL row uses the same text color, 92x30, weight 700.

**Saved row.** Item + rename (pencil) + delete (trash) icon buttons. Rename swaps the item for method badge + input + check button; Enter commits, Escape cancels. Delete shows an inline row under the item: "Delete this saved request?" in `--bad`, small danger "Delete" + small "Cancel".

**History.** Day headings ("Today", "Yesterday", then the date), 11px weight 600 `--fg3`. Item path line shows `<status> · <ms> ms · <hh:mm>` (Power Platform: `OK · 412 ms · 10:42`).

**URL row.** Padding 10 12, gap 8: method select, URL bar, Send (primary, arrow icon), Save (bookmark icon). URL bar: 30 high, field border, mono 12px; base URL prefix in `--fg4` (not editable), then the path input. Focus-within: brand outline.

**Sub-tabs** (Params / Headers / Body, and Body / Headers / Code). 32 high, padding 0 8, gap 4, `--fg2`. Active: `--fg1`, weight 600, 2px `--brand` underline inset 8. Request tabs carry a count badge (11px, `--bg4`, radius 8): params count, headers count, body "JSON" or "None".

**Key-value table** (Params, request Headers, response Headers). Border `--stroke`, radius 4, margin 10 12. Header row 12px weight 600 `--fg3` on `--bg2`. Request rows: checkbox (28) | key (mono) | value (mono). The `Authorization` row is checked and disabled with the muted value "Added by your PPTB connection". Last row: muted "Add parameter". Response headers: two columns, Header | Value.

**Response bar.** Padding 8 12, gap 10, border-bottom: status pill, `Time <b>184 ms</b>`, `Size <b>1.1 KB</b>` (12px `--fg3`, bold values `--fg1`), Live/Sample tag, spacer, small Copy button (copy icon, label turns "Copied" for 1.4 s). Copy copies what the active tab shows.

**Status pill.** 22 high, radius 11, 12px weight 600, then a lighter sub-label. OK: `--ok` family (`200 OK`, or `OK body only` for Power Platform). Sample: `--smp` family (`200 sample`). Error: `--bad` family (`404 Not Found`).

**JSON viewer.** Mono 12px/19px, padding 8 0. Per line: line number (36 wide, right-aligned, `--fg4` at .75 opacity, not selectable), fold column (16 wide; chevron button on lines that open an object or array), content indented 16 per level. Folded: `{ 4 keys }` / `[ 3 items ]` with the count in a small `--bg4` chip. Colors: keys `--k`, keys containing `@` `--ka` italic, strings `--s`, numbers `--n`, true/false/null `--b`, punctuation `--p`.

**Code tab.** Chips row (padding 8 12 0, gap 4): curl, PowerShell, JavaScript fetch, PPTB tool code. Chip 24 high, radius 12, border `--stroke2`; active `--sel` fill, `--brand` border and text, weight 600. Code block mono 12px/19px, padding 12 16, `--fg1`.

**Rail (endpoint card).** Header: "ENDPOINT" label + panel-toggle icon button, border-bottom. Body (padding 12 14, gap 14, scrolls): method badge + mode tag; title 14px/20px weight 600; description `--fg2`; "Microsoft docs" link with external icon; EXAMPLES label + full-width select; GOTCHAS label + count badge, then one row per gotcha (warning icon in `--smp`, 12.5px/18px `--fg2`, top border between rows; text in backticks renders mono); footer note 12px `--fg3` with a top border. Collapsed: 40px strip with the expand button and a vertical "N Gotchas" button (count badge in sample colors). Mode tag: "Live" (Dataverse), "Sample response" (Power Platform showing its sample), "Sample only" (SharePoint).

**Inline confirm bar.** Under the URL row, margin 0 12 10, padding 8 10, radius 4, `--bad-bg` fill, `--bad-bd` border, `role="alert"`: warning icon (`--bad`), "This sends **PATCH** to **Contoso Prod**, a Production environment.", small danger "Send to Production", small "Cancel".

**Empty state.** Centered, max-width 420, gap 8, `--fg3`: icon, title 14px weight 600 `--fg1`, one line of text.

**Section label.** 11px weight 600 `--fg3`, letter-spacing .02em, uppercase text as written ("EXAMPLES", "GOTCHAS").

## Behavior per API
| | Dataverse | Power Platform | SharePoint |
|---|---|---|---|
| URL prefix | org URL + `/api/data/v9.2/` | `https://api.powerplatform.com/<area>/` | `https://{site}/` |
| Send | live | live | off, tooltip "SharePoint is not called live yet" |
| Status pill | real status | `OK body only` (or error) | `200 sample` |
| Time | measured | measured; `—` for a sample | `—` |
| Response headers | real | info empty state: "No headers for Power Platform calls" + why | sample, note "Sample headers. Real values appear once SharePoint calls go live." |
| Rail tag | Live | Sample response | Sample only |

SharePoint: picking an endpoint shows its sample response right away. This replaces today's "Send returns the sample".

## States (Screen 4)
- **First open:** no endpoint picked, Send disabled until there is a path. Response area: arrow icon, "No request sent yet", "Pick an endpoint from the catalog, or type a path and press Send. The response, its gotchas and code samples show up here."
- **Loading:** Send disabled with a 14px spinner and "Sending…". Response bar: "Waiting for response…" + running time. 2px indeterminate bar (`--brand` on `--bg4`) under the bar. Skeleton lines (10 high, `--bg4`, radius 3) in the body.
- **Error:** real status in the error pill, error JSON as is in the Body tab.
- **Production confirm:** on a Production connection, Send shows the inline confirm bar. Nothing is sent until "Send to Production". Keep the existing rule for when it appears.

## Not in the mocks (decided here)
- Dataverse sidebar: the curated groups first, then the `$metadata` catalog as groups "Tables", "Functions", "Actions" with counts, collapsed by default. A group renders at most 300 items, then a muted row "N more, refine the search".
- No endpoint selected: the rail shows one muted line, "Pick an endpoint to see its docs, examples and gotchas."
- Window under 1100 px wide: the rail starts collapsed.
- Response bodies over 1 MB: plain pretty-printed text, no folding.

## Open (decide in step 3, ask Matt)
- Power Platform area for a hand-typed path. The mock only shows the prefix of the selected endpoint.

## Icons
16x16, `viewBox="0 0 16 16"`, `fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"`, `aria-hidden="true"` unless the icon is the only label.
| Icon | Markup |
|---|---|
| send | `<path d="M2.5 8h10M8.5 4l4 4-4 4"/>` |
| save | `<path d="M4 2.5h8v11l-4-3-4 3z"/>` |
| search | `<circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5 14 14"/>` |
| chevron | `<path d="M6 4l4 4-4 4"/>` |
| rename | `<path d="M10.5 2.5l3 3-8 8H2.5v-3z"/>` |
| delete | `<path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.7 9h5.6l.7-9"/>` |
| check | `<path d="M3 8.5l3 3 7-7"/>` |
| copy | `<rect x="5" y="5" width="8.5" height="8.5" rx="1.5"/><path d="M3 10.5V3.5A1 1 0 0 1 4 2.5h6.5"/>` |
| external | `<path d="M9 2.5h4.5V7M13.5 2.5 7.5 8.5M11.5 9.5v3a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3"/>` |
| warning | `<path d="M8 2.5 14 13.5H2z"/><path d="M8 6.5v3M8 11.5v.01"/>` |
| info | `<circle cx="8" cy="8" r="6"/><path d="M8 7.5v3.5M8 5v.01"/>` |
| panel | `<rect x="2" y="2.5" width="12" height="11" rx="1.5"/><path d="M10 2.5v11"/>` |

## Build steps
One step per commit. Typecheck, lint, unit tests, e2e, build and `pptb-validate` green before each commit. Update e2e selectors only where the DOM moved; never drop an assertion. After each step, compare against the matching mock and stop for Matt's OK.

**0. `EndpointDef` type.** One shape for everything the sidebar and rail show:
```ts
export interface EndpointDef {
    id: string; // stable, unique within its API
    api: ApiTarget; // pp:<Area> keeps the area
    group: string; // sidebar group
    method: HttpMethod;
    path: string; // relative to the URL prefix
    title: string; // sidebar item and rail heading (today's `summary`)
    description?: string; // one line under the rail heading
    docUrl?: string; // "Microsoft docs" link
    gotchas: string[]; // rail list (today's `notes`)
    examples?: EndpointExample[]; // rail Examples picker (reuse the existing example type)
    requestHeaders?: Record<string, string>;
    body?: unknown;
    sample?: { status: number; headers: Record<string, string>; body: unknown };
}
```
Add adapters from the existing sample type and from Dataverse catalog items, with unit tests (ids unique per API, every sample maps with a title and docs link). Don't rewrite the sample data files. No UI change.
Done when: type + adapters + tests committed, everything green.

**1. Tokens and the 3-column shell.** Import `tokens.css` before `style.css`; remove the old color variables from `style.css`. Restructure `index.html` into top bar + sidebar | main | rail. API tabs replace the API select (Power Platform remembers its last area; until step 3, the PP area picker stays in the URL row on that tab). Connection select and environment badge move to the top bar. The endpoint card moves into the rail, which collapses to 40 px. Inner panels keep today's look; steps 2 to 5 restyle them.
Done when: geometry and colors of the top bar, sidebar, rail and borders match `Main.light.png` and `Main.dark.png`, the theme follows PPTB live, everything green.

**2. Sidebar.** Segmented tabs, search, collapsible groups, items with badges and selection bar, History by day, Saved rename and delete inline, Save opens the new item in rename mode on the Saved tab. Compare: `Main`, `Screen2-Dataverse`.

**3. Request panel.** Method select, URL bar with prefix, Params/Headers/Body with counts, key-value tables, read-only JSON body view. Settle the open PP area question first. Compare: `Main`, `Screen2-Dataverse`.

**4. Response viewer.** Status bar, JSON viewer with folding, Headers table or info state, Code tab with chips, Copy. Compare: `Main`, `Screen2-Dataverse`, `Screen3-SharePoint`.

**5. Rail.** Endpoint card content and the collapsed strip. Compare: all three screens.

**6. States.** First open, loading, error, Production confirm bar. Remove the legacy token aliases. Compare: `Screen4-States`.
