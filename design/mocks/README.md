# Mocks

Visual reference for the redesign. The spec is `DESIGN.md` at the repo root.

- Canvas (Claude Design): https://claude.ai/artifact/Qje8Nm3KR5tySFhsceC8HC
- `*.png`: 1440 px wide screenshots, `.light` and `.dark`.
- `*.dc.html`: Claude Design source (`{{holes}}`, `<sc-for>`, `<sc-if>`). Not plain HTML and won't open on their own. Read them for exact CSS; never copy them into `src/`.

| File | Screen |
|---|---|
| `Main` | 1. Power Platform, Direction A (chosen) |
| `DirectionB` | 1B. Not chosen, reference only (light only) |
| `Screen2-Dataverse` | 2. Dataverse, live response with formatted values |
| `Screen3-SharePoint` | 3. SharePoint, sample only, Code tab |
| `Screen4-States` | 4. First open, loading, error, Production confirm |

Note: in the `Screen4-States` screenshots the small JSON blocks render on one line. That's a screenshot artifact. The JSON viewer shows one value per line, as in screens 1 to 3.
