# Publish checklist (rough sketch)

- Add package name + description to README
- Decide on license (MIT/Apache-2.0/etc)
- Document the 3 core rules:
  - components run once
  - reactivity only through adapters/control structures
  - cleanup happens via renderer `remove()` + `onRemove`
- Add one minimal example and one stress example
- Call out limitations explicitly (no vDOM, no rerender)

Optional but nice:

- Add a tiny `EACH`/`IF` alias layer (ergonomics)
- Add a stable key API for `_EACH`
