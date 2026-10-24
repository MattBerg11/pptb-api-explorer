# Plan: copy as curl / code snippet

Goal: from any request in the explorer, copy working code for the same call to use outside PPTB.

## UX
- A **Code** button next to Save opens a panel under the request.
- Tabs: **curl**, **PowerShell**, **JavaScript (fetch)**, **PPTB tool code**.
- Each tab has a Copy button and updates live as the request changes.
- Works the same for live and sample-only APIs (SharePoint).

## What each snippet contains
- Full URL:
  - Dataverse: `{connection.url}/api/data/v9.2/{path}`
  - Power Platform API: `https://api.powerplatform.com/{area}/{path}`
  - SharePoint: `https://{tenant}.sharepoint.com/sites/{site}/{path}` with the placeholders left in
- Method, headers from the request, plus the defaults the host normally adds:
  - Dataverse: `Accept: application/json`, `OData-MaxVersion: 4.0`, `OData-Version: 4.0`
  - SharePoint: `Accept: application/json;odata=nometadata`
- Body, pretty-printed JSON.
- `Authorization: Bearer $TOKEN`, never a real token (the tool never sees one anyway).
- A one-line comment on how to get the token with the Azure CLI, e.g.
  `az account get-access-token --resource https://api.powerplatform.com --query accessToken -o tsv`
  (resource is the Dataverse org URL for Dataverse, the tenant root for SharePoint).

## PPTB tool code tab
- Shows the exact `window.dataverseAPI` / `window.powerplatformAPI` call this explorer makes, e.g.
  `await powerplatformAPI.Licensing.Get("billingPolicies?api-version=2024-10-01")`.
- This is the most PPTB-specific output: it shows tool authors how to call the API from their own tool.

## Build
- `src/snippets.ts`: pure `toSnippet(spec, language, context)` functions, no DOM. Easy to unit test.
- Escaping per language: single-quote escaping for curl, here-strings for PowerShell, `JSON.stringify` for JS.
- Small UI change in `main.ts` / `index.html` for the panel.
- Estimate: one PR, around 200 lines.

## Out of scope (later list)
- C#, Python
- Postman collection or `.http` file export
- Snippets for a whole saved collection
