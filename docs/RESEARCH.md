# PPTB tool research (2026-10-20)

Source: github.com/PowerPlatformToolBox/desktop-app (types in packages/types, @pptb/types 1.2.7). docs.powerplatformtoolbox.com did not resolve from the cloud container.

## How tools are built
- A tool is an npm package (HTML/JS UI, loaded in an isolated host, VS Code extension-host style).
- package.json required: name, version, displayName, description, license, contributors[]. Optional: icon (relative SVG under dist), cspExceptions (external domains, user must consent), configurations, features.
- features: connections (0-10 or {min,max}), minAPI, enabledForPowerPlatformAPI.
- Optional pptb.config.json: invocation (other tools call us), agents (MCP / headless).
- Validate with `@pptb/validate` (pptb-validate).

## Host APIs (window.*)
- toolboxAPI: connections (getActiveConnection, getConnections), getToolContext, settings get/set, notifications, clipboard, theme, fileSystem, terminal (create/execute), events, utils.openInConnectionBrowser.
- dataverseAPI: CRUD, fetchXmlQuery, queryData (raw OData), execute (actions/functions), executeBatch, metadata (getAllEntitiesMetadata, getEntityMetadata, getCSDLDocument), solutions. All accept connectionTarget + additionalHeaders.
- powerplatformAPI: generic Get/Post/Put/Patch/Delete per category on api.powerplatform.com (Analytics, AppManagement, Authorization, Connectivity, CopilotStudio, Dynamics, EnvironmentManagement, Governance, Licensing, PowerApps, PowerAutomate, PowerPages, ResourceQuery, UserManagement, WorkflowAgents). Needs a connection with enabledForPowerPlatformAPI.

## Auth
- Tools never see access tokens ("accessToken is NOT included for security").
- Host acquires tokens with MSAL, scope `${connection.url}/.default` (Dataverse) and separate Power Platform API scopes.
- No host API for SharePoint or Graph tokens. Options: upstream feature request for a generic resource API, or a workaround (terminal + az/m365 CLI token, plus cspExceptions for *.sharepoint.com). Neither is v1.
