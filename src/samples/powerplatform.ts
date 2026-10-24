// Power Platform API samples. Send makes a live call through window.powerplatformAPI;
// the sample response shows the shape before you run it. Microsoft's reference pages
// list schemas but rarely show a response, so these bodies are built from the
// documented schemas (and SDK models) with made-up values.
// Paths are relative to https://api.powerplatform.com/<area>/, which is how the host client takes them.

import type { SampleEndpoint } from "./types";

const REF = "https://learn.microsoft.com/en-us/rest/api/power-platform";
const ENV_ID = "{environmentId}";
const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

const RAW: Omit<SampleEndpoint, "api">[] = [
    {
        group: "EnvironmentManagement",
        method: "GET",
        path: "environments?api-version=2024-10-01",
        summary: "List environments you can access",
        docUrl: `${REF}/environmentmanagement/environments/list-environments-for-user`,
        notes: [
            "id is the environment ID that every environment-scoped path needs. dataverseId is the Dataverse org ID, a different GUID.",
            "$filter only supports dataverseId, type, geo, state, environmentGroupId and domainName.",
            "Paging link is documented as @odata.nextlink (lowercase l) here, but @odata.nextLink on other endpoints. Check both.",
        ],
        response: {
            status: 200,
            headers: JSON_HEADERS,
            body: {
                value: [
                    {
                        id: "8a3c2f10-4b7e-4d1a-9c55-2e6f0b1d7a90",
                        displayName: "Contoso Dev",
                        type: "Sandbox",
                        state: "Enabled",
                        geo: "unitedstates",
                        azureRegion: "westus",
                        url: "https://contosodev.crm.dynamics.com/",
                        domainName: "contosodev",
                        dataverseId: "1f9e7c42-0d3a-4e8b-b6a1-7c5d2e9f0a13",
                        version: "9.2.25094.00177",
                        tenantId: "72f988bf-0000-0000-0000-2d7cd011db47",
                        environmentGroupId: null,
                        createdDateTime: "2025-02-11T18:24:05Z",
                        createdBy: { id: "c0ffee00-1111-2222-3333-444455556666", type: "User" },
                        securityGroupId: null,
                        protectionLevel: "Standard",
                    },
                ],
            },
        },
    },
    {
        group: "EnvironmentManagement",
        method: "GET",
        path: `environments/${ENV_ID}?api-version=2024-10-01`,
        summary: "Get one environment",
        docUrl: `${REF}/environmentmanagement/environments/get-environment-by-id-for-user`,
        notes: ["Replace {environmentId} with the id from List environments, not the Dataverse org ID."],
        response: {
            status: 200,
            headers: JSON_HEADERS,
            body: {
                id: "8a3c2f10-4b7e-4d1a-9c55-2e6f0b1d7a90",
                displayName: "Contoso Dev",
                type: "Sandbox",
                state: "Enabled",
                url: "https://contosodev.crm.dynamics.com/",
                dataverseId: "1f9e7c42-0d3a-4e8b-b6a1-7c5d2e9f0a13",
            },
        },
    },
    {
        group: "EnvironmentManagement",
        method: "GET",
        path: "environmentGroups?api-version=2024-10-01",
        summary: "List environment groups",
        docUrl: `${REF}/environmentmanagement/environment-groups/list-environment-groups`,
        notes: ["When there are no groups the docs list 204 No Content, so expect an empty body, not { value: [] }.", "Errors use the ProblemDetails shape (type, title, status, detail)."],
        response: {
            status: 200,
            headers: JSON_HEADERS,
            body: {
                value: [
                    {
                        id: "5b0d9a7e-3c21-4f6e-8a90-b1c2d3e4f5a6",
                        displayName: "Finance",
                        description: "Finance team environments",
                        parentGroupId: null,
                        childrenGroupIds: [],
                        createdTime: "2025-06-02T09:15:00Z",
                        createdBy: { id: "c0ffee00-1111-2222-3333-444455556666", displayName: "Megan Bowen", type: "User" },
                    },
                ],
            },
        },
    },
    {
        group: "PowerApps",
        method: "GET",
        path: `environments/${ENV_ID}/apps?api-version=2024-10-01&$top=1`,
        summary: "List apps in an environment (admin)",
        docUrl: `${REF}/powerapps/apps/get-admin-apps`,
        notes: [
            "Paging uses nextLink (no @odata. prefix) with $skiptoken.",
            "connectionReferences[].apiTier shows Standard vs Premium connectors per app, handy for licensing checks.",
            "Real responses are large; each app carries owner, createdBy, lastModifiedBy and version objects.",
        ],
        response: {
            status: 200,
            headers: JSON_HEADERS,
            body: {
                nextLink: "https://api.powerplatform.com/powerapps/environments/8a3c2f10-.../apps?api-version=2024-10-01&$top=1&$skiptoken=...",
                value: [
                    {
                        id: "/providers/Microsoft.PowerApps/apps/3f1e2d4c-5b6a-4789-8c0d-1e2f3a4b5c6d",
                        name: "3f1e2d4c-5b6a-4789-8c0d-1e2f3a4b5c6d",
                        type: "Microsoft.PowerApps/apps",
                        properties: {
                            displayName: "Expense Tracker",
                            description: "",
                            appVersion: "2026-09-30T17:02:11Z",
                            createdTime: "2025-11-04T15:40:22Z",
                            lastModifiedTime: "2026-09-30T17:02:11Z",
                            sharedUsersCount: 12,
                            sharedGroupsCount: 1,
                            owner: { id: "c0ffee00-1111-2222-3333-444455556666", displayName: "Megan Bowen", email: "megan@contoso.com", type: "User" },
                            environment: { id: "/providers/Microsoft.PowerApps/environments/8a3c2f10-...", name: "8a3c2f10-4b7e-4d1a-9c55-2e6f0b1d7a90" },
                            connectionReferences: [{ id: "/providers/microsoft.powerapps/apis/shared_sql", displayName: "SQL Server", apiTier: "Premium" }],
                            appOpenUri: "https://apps.powerapps.com/play/e/8a3c2f10-.../a/3f1e2d4c-...",
                        },
                    },
                ],
            },
        },
    },
    {
        group: "PowerAutomate",
        method: "GET",
        path: `environments/${ENV_ID}/cloudFlows?api-version=2024-10-01`,
        summary: "List cloud flows in an environment",
        docUrl: `${REF}/powerautomate`,
        notes: [
            "createdBy and ownerId are Dataverse IDs (systemuser), not Entra object IDs.",
            "definition is the workflow's clientdata: a JSON string, so parse it twice.",
            "Shape here comes from the SDK's CloudFlow model; the REST page has no example.",
        ],
        response: {
            status: 200,
            headers: JSON_HEADERS,
            body: {
                value: [
                    {
                        workflowId: "6d7e8f90-1a2b-4c3d-9e8f-0a1b2c3d4e5f",
                        name: "Notify on new expense",
                        uniqueName: "new_Notifyonnewexpense",
                        description: null,
                        stateCode: "Activated",
                        statusCode: "Activated",
                        createdOn: "2026-01-14T10:05:00Z",
                        modifiedOn: "2026-08-21T16:47:31Z",
                        createdBy: "aa11bb22-cc33-dd44-ee55-ff6677889900",
                        ownerId: "aa11bb22-cc33-dd44-ee55-ff6677889900",
                        resourceId: "6d7e8f90-1a2b-4c3d-9e8f-0a1b2c3d4e5f",
                        definition: '{"properties":{"connectionReferences":{...},"definition":{...}}}',
                    },
                ],
            },
        },
    },
    {
        group: "Licensing",
        method: "GET",
        path: "billingPolicies?api-version=2024-10-01",
        summary: "List pay-as-you-go billing policies",
        docUrl: `${REF}/licensing/billing-policy/list-billing-policies`,
        notes: ["The docs describe $top as 'The ISV contract ID'. It is a page size.", "billingInstrument points at the Azure subscription and resource group that gets billed."],
        response: {
            status: 200,
            headers: JSON_HEADERS,
            body: {
                value: [
                    {
                        id: "0f1e2d3c-4b5a-6978-8f9e-a0b1c2d3e4f5",
                        name: "Contoso PAYG",
                        location: "unitedstates",
                        status: "Enabled",
                        billingInstrument: { id: "...", subscriptionId: "11111111-2222-3333-4444-555555555555", resourceGroup: "rg-powerplatform-billing" },
                        createdOn: "2025-03-01T12:00:00Z",
                        createdBy: { id: "c0ffee00-1111-2222-3333-444455556666", type: "User" },
                        lastModifiedOn: "2025-03-01T12:00:00Z",
                        lastModifiedBy: { id: "c0ffee00-1111-2222-3333-444455556666", type: "User" },
                    },
                ],
            },
        },
    },
    {
        group: "ResourceQuery",
        method: "POST",
        path: "resources/query?api-version=2024-10-01",
        summary: "Inventory query: canvas apps across the tenant",
        docUrl: "https://learn.microsoft.com/en-us/power-platform/admin/inventory-api",
        notes: [
            "String values need KQL quotes inside the JSON string: \"'microsoft.powerapps/canvasapps'\".",
            "Projected dotted names come back flattened: properties.displayName becomes properties_displayName.",
            "Delegated user tokens only. Service principals get 403.",
            "Page with Options.SkipToken from the previous response's skipToken.",
        ],
        body: {
            TableName: "PowerPlatformResources",
            Clauses: [
                { $type: "where", FieldName: "type", Operator: "==", Values: ["'microsoft.powerapps/canvasapps'"] },
                { $type: "project", FieldList: ["name", "properties.displayName", "properties.createdAt", "properties.environmentId"] },
                { $type: "take", TakeCount: 2 },
            ],
            Options: { Top: 2 },
        },
        response: {
            status: 200,
            headers: JSON_HEADERS,
            body: {
                totalRecords: 2,
                count: 2,
                resultTruncated: 1,
                skipToken: null,
                data: [
                    {
                        name: "3f1e2d4c-5b6a-4789-8c0d-1e2f3a4b5c6d",
                        properties_displayName: "Expense Tracker",
                        properties_createdAt: "2025-11-04T15:40:22Z",
                        properties_environmentId: "8a3c2f10-4b7e-4d1a-9c55-2e6f0b1d7a90",
                    },
                    {
                        name: "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d",
                        properties_displayName: "Site Inspection",
                        properties_createdAt: "2026-02-19T08:12:40Z",
                        properties_environmentId: "8a3c2f10-4b7e-4d1a-9c55-2e6f0b1d7a90",
                    },
                ],
            },
        },
    },
    {
        group: "CopilotStudio",
        method: "GET",
        path: `environments/${ENV_ID}/bots/{botId}/api/botQuarantine?api-version=1`,
        summary: "Get an agent's quarantine status",
        docUrl: `${REF}/copilotstudio/bots/get-bot-quarantine-status`,
        notes: [
            "This one uses api-version=1, not a date like the rest of the API.",
            "{botId} is the Dataverse bot record ID.",
            "Quarantine calls return 405 for classic chatbots.",
        ],
        response: {
            status: 200,
            headers: JSON_HEADERS,
            body: { isBotQuarantined: false, lastUpdateTimeUtc: "2026-10-01T14:22:09Z" },
        },
    },
];

export const POWERPLATFORM_SAMPLES: SampleEndpoint[] = RAW.map((s) => ({ ...s, api: `pp:${s.group}` as SampleEndpoint["api"] }));
