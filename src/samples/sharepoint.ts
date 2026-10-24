// SharePoint REST samples. PPTB has no host API for SharePoint tokens, so these are
// documented example requests with realistic sample responses, not live calls.
// Responses use "Accept: application/json;odata=nometadata", the lightest format.

import type { SampleEndpoint } from "./types";

const SITE = "https://contoso.sharepoint.com/sites/demo";
const JSON_HEADERS = { "content-type": "application/json;odata=nometadata;streaming=true;charset=utf-8" };

const RAW: Omit<SampleEndpoint, "api">[] = [
    {
        group: "Site",
        method: "GET",
        path: "_api/web?$select=Title,Url,Id,Created,WebTemplate,Language",
        summary: "Get the current site (web)",
        notes: [
            "Without $select you get ~60 properties. Always $select what you need.",
            "Paths are relative to the site URL, e.g. " + SITE + "/_api/web.",
        ],
        response: {
            status: 200,
            headers: JSON_HEADERS,
            body: {
                Created: "2024-03-11T14:02:18.123Z",
                Id: "5f0b1c33-8f6e-4e57-9a5a-4d2b7f6a1e01",
                Language: 1033,
                Title: "Demo",
                Url: SITE,
                WebTemplate: "STS",
            },
        },
    },
    {
        group: "Site",
        method: "GET",
        path: "_api/web/currentuser?$select=Id,Title,Email,LoginName,IsSiteAdmin",
        summary: "Get the signed-in user",
        notes: ["Id is the site-scoped user id, not the Entra object id. Lookup and Person fields store this Id."],
        response: {
            status: 200,
            headers: JSON_HEADERS,
            body: {
                Email: "megan@contoso.com",
                Id: 11,
                IsSiteAdmin: false,
                LoginName: "i:0#.f|membership|megan@contoso.com",
                Title: "Megan Bowen",
            },
        },
    },
    {
        group: "Site",
        method: "GET",
        path: "_api/web/siteusers?$select=Id,Title,Email&$filter=PrincipalType eq 1",
        summary: "List users known to the site",
        notes: ["PrincipalType 1 = user, 4 = SharePoint group, 8 = security group.", "Collections come back wrapped in a value array."],
        response: {
            status: 200,
            headers: JSON_HEADERS,
            body: {
                value: [
                    { Email: "megan@contoso.com", Id: 11, Title: "Megan Bowen" },
                    { Email: "alex@contoso.com", Id: 12, Title: "Alex Wilber" },
                ],
            },
        },
    },
    {
        group: "Site",
        method: "POST",
        path: "_api/contextinfo",
        summary: "Get a form digest (X-RequestDigest)",
        notes: [
            "Only needed for writes made with cookie auth (e.g. from a SharePoint page). Calls with an OAuth bearer token do not need it.",
            "The digest expires after FormDigestTimeoutSeconds.",
        ],
        response: {
            status: 200,
            headers: JSON_HEADERS,
            body: {
                FormDigestTimeoutSeconds: 1800,
                FormDigestValue: "0x8E2A...C4F1,20 Oct 2026 05:12:00 -0000",
                LibraryVersion: "16.0.25523.12008",
                SiteFullUrl: SITE,
                WebFullUrl: SITE,
            },
        },
    },
    {
        group: "Lists",
        method: "GET",
        path: "_api/web/lists?$select=Id,Title,ItemCount,BaseTemplate&$filter=Hidden eq false",
        summary: "List visible lists and libraries",
        notes: ["BaseTemplate 100 = custom list, 101 = document library, 171 = tasks (modern)."],
        response: {
            status: 200,
            headers: JSON_HEADERS,
            body: {
                value: [
                    { BaseTemplate: 101, Id: "8c4e1a2b-7f30-4d1e-9c6b-0a1b2c3d4e5f", ItemCount: 42, Title: "Documents" },
                    { BaseTemplate: 100, Id: "1d2e3f40-5a6b-4c7d-8e9f-a0b1c2d3e4f5", ItemCount: 3, Title: "Tasks" },
                ],
            },
        },
    },
    {
        group: "Lists",
        method: "GET",
        path: "_api/web/lists/getbytitle('Tasks')/fields?$select=Title,InternalName,TypeAsString,Required&$filter=Hidden eq false and ReadOnlyField eq false",
        summary: "List editable columns of a list",
        notes: [
            "Use InternalName in item queries and payloads, not the display Title.",
            "Spaces in internal names are encoded, e.g. 'Due Date' becomes Due_x0020_Date.",
        ],
        response: {
            status: 200,
            headers: JSON_HEADERS,
            body: {
                value: [
                    { InternalName: "Title", Required: true, Title: "Title", TypeAsString: "Text" },
                    { InternalName: "Due_x0020_Date", Required: false, Title: "Due Date", TypeAsString: "DateTime" },
                    { InternalName: "AssignedTo", Required: false, Title: "Assigned To", TypeAsString: "User" },
                    { InternalName: "Status", Required: false, Title: "Status", TypeAsString: "Choice" },
                ],
            },
        },
    },
    {
        group: "Items",
        method: "GET",
        path: "_api/web/lists/getbytitle('Tasks')/items?$select=Id,Title,Status,Due_x0020_Date,AssignedTo/Title,AssignedTo/Email&$expand=AssignedTo&$top=2",
        summary: "Get list items, including a person field",
        notes: [
            "Person and lookup fields need $expand plus $select of the sub-properties. Without them you only get AssignedToId.",
            "Paging: follow odata.nextLink. $skip is ignored on list items.",
            "Dates are returned in UTC.",
        ],
        response: {
            status: 200,
            headers: JSON_HEADERS,
            body: {
                "odata.nextLink": `${SITE}/_api/web/lists/getbytitle('Tasks')/items?%24skiptoken=Paged%3dTRUE%26p_ID%3d2&%24top=2`,
                value: [
                    {
                        AssignedTo: { Email: "megan@contoso.com", Title: "Megan Bowen" },
                        Due_x0020_Date: "2026-10-31T07:00:00Z",
                        Id: 1,
                        ID: 1,
                        Status: "In progress",
                        Title: "Draft launch plan",
                    },
                    {
                        AssignedTo: { Email: "alex@contoso.com", Title: "Alex Wilber" },
                        Due_x0020_Date: null,
                        Id: 2,
                        ID: 2,
                        Status: "Not started",
                        Title: "Review budget",
                    },
                ],
            },
        },
    },
    {
        group: "Items",
        method: "POST",
        path: "_api/web/lists/getbytitle('Tasks')/GetItems",
        summary: "Query items with CAML",
        notes: ["Use when OData $filter cannot express the query, or the list is over the 5,000 item view threshold and you need indexed CAML."],
        requestHeaders: { "Content-Type": "application/json;odata=nometadata" },
        body: {
            query: {
                ViewXml:
                    "<View><Query><Where><Eq><FieldRef Name='Status'/><Value Type='Choice'>In progress</Value></Eq></Where></Query><RowLimit>10</RowLimit></View>",
            },
        },
        response: {
            status: 200,
            headers: JSON_HEADERS,
            body: { value: [{ Id: 1, ID: 1, Status: "In progress", Title: "Draft launch plan" }] },
        },
    },
    {
        group: "Items",
        method: "POST",
        path: "_api/web/lists/getbytitle('Tasks')/items",
        summary: "Create a list item",
        notes: [
            "With odata=nometadata you can skip the __metadata type. With odata=verbose you must send __metadata: { type: 'SP.Data.TasksListItem' }.",
            "Person fields are set by user Id: AssignedToId (single) or AssignedToId: [11, 12] for multi.",
        ],
        requestHeaders: { "Content-Type": "application/json;odata=nometadata" },
        body: { Title: "Book venue", Status: "Not started", AssignedToId: 11 },
        response: {
            status: 201,
            headers: { ...JSON_HEADERS, etag: '"1"' },
            body: { AssignedToId: 11, Created: "2026-10-20T05:20:11Z", Id: 3, ID: 3, Status: "Not started", Title: "Book venue" },
        },
    },
    {
        group: "Items",
        method: "PATCH",
        path: "_api/web/lists/getbytitle('Tasks')/items(3)",
        summary: "Update a list item",
        notes: [
            "IF-MATCH is required. Use * to overwrite, or the item's etag to fail on conflicts (412).",
            "Older docs show POST with X-HTTP-Method: MERGE. PATCH works the same.",
            "Success returns 204 with an empty body, so read the item again if you need the new values.",
        ],
        requestHeaders: { "Content-Type": "application/json;odata=nometadata", "IF-MATCH": "*" },
        body: { Status: "Completed" },
        response: { status: 204, headers: { etag: '"2"' }, body: null },
    },
    {
        group: "Items",
        method: "DELETE",
        path: "_api/web/lists/getbytitle('Tasks')/items(3)",
        summary: "Delete a list item (permanent)",
        notes: ["Use POST .../items(3)/recycle() instead to send it to the recycle bin. That returns the recycle bin item GUID."],
        requestHeaders: { "IF-MATCH": "*" },
        response: { status: 200, headers: {}, body: null },
    },
    {
        group: "Files",
        method: "GET",
        path: "_api/web/GetFolderByServerRelativeUrl('Shared Documents')/Files?$select=Name,ServerRelativeUrl,Length,TimeLastModified,UniqueId",
        summary: "List files in a folder",
        notes: [
            "The library title is 'Documents' but its URL is 'Shared Documents'. Folder and file paths use the URL.",
            "Length is a string, not a number.",
            "Paths with ' or # break this call. Use GetFolderByServerRelativePath(decodedUrl='...') instead.",
        ],
        response: {
            status: 200,
            headers: JSON_HEADERS,
            body: {
                value: [
                    {
                        Length: "48213",
                        Name: "report.docx",
                        ServerRelativeUrl: "/sites/demo/Shared Documents/report.docx",
                        TimeLastModified: "2026-10-18T16:40:02Z",
                        UniqueId: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
                    },
                ],
            },
        },
    },
    {
        group: "Files",
        method: "GET",
        path: "_api/web/GetFileByServerRelativeUrl('/sites/demo/Shared Documents/report.docx')/$value",
        summary: "Download file content",
        notes: ["Returns raw bytes, not JSON. Drop /$value to get the file's properties instead."],
        response: { status: 200, headers: { "content-type": "application/octet-stream" }, body: "<binary file content>" },
    },
    {
        group: "Files",
        method: "POST",
        path: "_api/web/GetFolderByServerRelativeUrl('Shared Documents')/Files/add(url='notes.txt',overwrite=true)",
        summary: "Upload a small file",
        notes: ["The body is the raw file bytes. Files over ~250 MB need the StartUpload / ContinueUpload / FinishUpload chunked calls."],
        requestHeaders: { "Content-Type": "application/octet-stream" },
        body: "hello world",
        response: {
            status: 200,
            headers: JSON_HEADERS,
            body: { Length: "11", Name: "notes.txt", ServerRelativeUrl: "/sites/demo/Shared Documents/notes.txt", TimeLastModified: "2026-10-20T05:21:44Z" },
        },
    },
    {
        group: "Search",
        method: "GET",
        path: "_api/search/query?querytext='launch plan'&selectproperties='Title,Path,Author'&rowlimit=2",
        summary: "Search content",
        notes: [
            "Results are buried in PrimaryQueryResult.RelevantResults.Table.Rows, and each row is a list of Key/Value cells, not an object.",
            "String parameters need single quotes inside the URL.",
        ],
        response: {
            status: 200,
            headers: JSON_HEADERS,
            body: {
                ElapsedTime: 84,
                PrimaryQueryResult: {
                    RelevantResults: {
                        RowCount: 1,
                        Table: {
                            Rows: [
                                {
                                    Cells: [
                                        { Key: "Title", Value: "Launch plan", ValueType: "Edm.String" },
                                        { Key: "Path", Value: `${SITE}/Shared Documents/Launch plan.docx`, ValueType: "Edm.String" },
                                        { Key: "Author", Value: "Megan Bowen", ValueType: "Edm.String" },
                                    ],
                                },
                            ],
                        },
                        TotalRows: 1,
                    },
                },
            },
        },
    },
    {
        group: "Errors",
        method: "GET",
        path: "_api/web/lists/getbytitle('Taks')",
        summary: "What an error looks like (list not found)",
        notes: ["Errors use the odata.error shape. The message text is localized to the site language."],
        response: {
            status: 404,
            headers: JSON_HEADERS,
            body: {
                "odata.error": {
                    code: "-2130575322, System.ArgumentException",
                    message: { lang: "en-US", value: "List 'Taks' does not exist at site with URL '" + SITE + "'." },
                },
            },
        },
    },
];

export const SHAREPOINT_SAMPLES: SampleEndpoint[] = RAW.map((s) => ({ ...s, api: "sharepoint" }));
