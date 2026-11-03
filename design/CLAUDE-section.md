## UI redesign
- The UI is being rebuilt to match `design/mocks/` (Direction A). Spec: `DESIGN.md`. Colors and sizes: `src/styles/tokens.css`.
- Match the mocks. No features beyond `DESIGN.md`. If something is in neither, ask Matt instead of inventing it.
- `design/mocks/*.dc.html` are Claude Design source files, not plain HTML. Use them for exact CSS values; never copy them into `src/`.
- No hex colors outside `tokens.css`. Inline SVG icons from the list in `DESIGN.md`.
- Follow the build steps in `DESIGN.md` in order, one step per commit, everything green. Stop after each step so Matt can compare it against the mock.
