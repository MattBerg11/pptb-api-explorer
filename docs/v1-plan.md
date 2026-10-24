# v1 plan: definition of done

The goal is a long unattended run that ends with v1 finished. Every item can be checked without asking Matt. Decisions are made up front, below.

## Order of work (Matt, 2026-10-24)
1. Sync the local folder to the `initial-scaffold` branch.
2. Get the information right: agent skills with endpoint references, plus robust tests.
3. Work through the rest of this checklist.

The plan for keeping endpoint data current is handled separately (`docs/data-freshness-plan.md` in project files).

## Done when

**Correct information**
- [ ] Agent skills in `.claude/skills/` with endpoint references for the Dataverse Web API, Power Platform API and SharePoint REST: paths, methods, api-versions, request and response shapes, and official doc links, all taken from Microsoft Learn
- [ ] Every sample in the tool is checked against those references (path, method, api-version, field names)

**Coverage**
- [x] Dataverse: endpoint browser from `$metadata` (tables, unbound functions and actions)
- [ ] Dataverse: about 8 curated samples with gotcha cards: WhoAmI, query with formatted-value annotations, create with `@odata.bind`, upsert, `$batch`, the error shape
- [ ] Power Platform API: at least one documented endpoint for every area that has public reference docs (8 today, target about 20)
- [x] SharePoint: 16 sample endpoints
- [ ] Every endpoint (Dataverse catalog items and all samples) has a button that opens its official Microsoft docs page, and a unit test fails if any sample lacks one
- [ ] Copy as code: curl, PowerShell, JS fetch and PPTB tool code (per `docs/snippets-plan.md`)

**Quality**
- [ ] Unit tests (Vitest) for the CSDL parser, sample lookup, snippet generators and path handling, plus data checks on every sample (valid method, api-version present, docs link, JSON body)
- [ ] An end-to-end smoke test (Playwright with mocked PPTB APIs) committed to the repo
- [ ] GitHub Actions CI running typecheck, lint, tests, build and `pptb-validate`, all green
- [ ] ESLint and Prettier, using the same setup as `pptb-optionset-manager`
- [ ] Errors shown with `toolboxAPI.utils.showNotification`, never silent
- [ ] Saved requests can be renamed and deleted inline (no `prompt()`)
- [ ] The tool follows PPTB theme changes while it is open

**Docs and release prep**
- [ ] README covers features, a screenshot for each API, loading the tool locally, and known limits
- [ ] CHANGELOG, with the version set to 1.0.0
- [ ] `pptb-validate` passes with URL checks on
- [ ] `npm run finalize-package` (shrinkwrap) is done. Not published.

## Decisions (approve once)
1. **Where:** work locally in `C:\Projects\powerplatformtoolbox\Tools\pptb-api-explorer` on Matt's machine, no PRs. One local commit per checklist item, never pushed.
2. **UI:** stays vanilla TypeScript, with no React or Fluent UI. It's smaller, and the current look holds up.
3. **Sample values:** made up and built from the documented schemas, always labelled as samples.
4. **Unclear endpoints:** if the docs don't show a path or shape clearly, skip it rather than guess.
5. **Tests:** Vitest for unit tests and Playwright for the smoke test.
6. **Publishing:** never. `npm publish` and pushing to `main` stay with Matt unless he says otherwise.
7. **Stopping:** the run stops when the checklist is done or everything left is blocked on Matt. One summary at the end, plus a note in the thread if something blocks early.

## Needs Matt
- Load the tool in real PPTB (Debug > Load Local Tool). Test live Dataverse calls, and Power Platform API calls with a connection that has "enabled for Power Platform API" on. Report anything broken.
- `npm publish` and the PPTB tool submission.

## Later (not v1)
- Microsoft Graph
- Live SharePoint calls (needs a PPTB host feature)
- Bound Dataverse operations in the browser
- C# and Python snippets, Postman or `.http` export
- MCP / agent invocation (`pptb.config.json`)
