> Markdown code blocks cannot show markless's element highlighting. The examples
> below are generated SVGs from the same TypeScript sources as the
> [interactive examples on the home page](https://huberst.github.io/markless/).
> After changing an example, run `deno task gen-readme-examples` to refresh both
> versions.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="page/assets/logo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="page/assets/logo-light.svg">
  <img alt="MarkLessLogo" src="page/assets/logo-light.svg">
</picture>

<!-- ![MarkLessLogo](page/assets/logo-dark.svg) -->

**Plain TypeScript - Reactive - UI Components**

markless is a library which allows you to build UI for the browser, with a dev
experience somewhat similar to React, but without having to leave or enhance
TypeScript-Land.

## How to install

Add markless to a Deno project from JSR:

```sh
deno add jsr:@huberst/markless
```

Or install it from npm:

```sh
npm install @huberst/markless
```

## The Mission: HTML-level scannability, pure TS

The biggest hurdle was to achieve a visual distinction of HTML elements from the
rest of the syntax. Because that is what XML and thus HTML and JSX are so strong
at: You can quickly grasp the structure of the document.

First I tried to make the HTML elements visually striking, by using underscores
or special characters, like in these examples:

- `_div_`
- `__div__`
- `$_div`
- `$_DIV`

But none of these really helped scanning a component as quickly with your eyes,
as you can with HTML / JSX.

Then I found a little trick to make it work: **Using static members on classes,
with one class for each HTML element!**

Most themes for syntax highlighting will highlight classes noticeably different,
so they are easy to spot for your eyes. In VS Code Dark Modern, for example,
they are colored in a green or almost turquoise color, which is also used for
type information.

![UsingElements TypeScript example](page/assets/UsingElements.svg)

![UsingElementsNesting TypeScript example](page/assets/UsingElementsNesting.svg)

### What are the benefits of this approach?

- No need for a template language syntax like JSX, lit-html, or similar and
  their overhead.
- Therefore no editor / IDE extension for that syntax.
- No extra type-checking logic for that syntax.
- No build step required to transform that syntax into JS/TS.
- No virtual DOM.
- No magic.

## Element API

- **Content:** `._(...)` adds text, elements, and components as children.
- **Properties:** `.prop('value', value)` and `.propSet({ checked: true })`
  assign DOM properties, including reactive values. Names and values are checked
  against the element's DOM type.
- **Attributes:** `.attr('aria-label', 'Close')` and
  `.attrSet({ viewBox: '0 0 100 100' })` set HTML or SVG attributes, including
  reactive values. Attribute names are strings because TypeScript's DOM types do
  not list attributes by tag. On an element description,
  `.dataAttr('state', 'open')` is shorthand for `data-state`.
- **Appearance:** `.class('active', activeClass)` adds static or reactive classes.
  `.style({ color: 'red' })` sets inline styles; a reactive style object also
  removes declarations that disappear on subsequent updates.
- **Interaction and lifecycle:** `.event('click', handler)` registers a handler;
  `.setRef(callback)` provides a typed DOM element reference.
  `.afterMount(callback)` and `.onRemove(callback)` run on mounting and removal.

## But what about reactivity?

markless components never 're-render' in the sense of React or Vue. All updates
are driven by reactive adapters, which can be built on top of any reactive
source you like. Reactive adapters for preact signals and RxJS are already
included. They are easy to integrate.

![ReactiveColorSelection TypeScript example](page/assets/ReactiveColorSelection.svg)

## Of course there is a todo app example 🙄

![MinimalTodo TypeScript example](page/assets/MinimalTodo.svg)

## Mixing multiple reactive sources

![SearchWithSuggestions TypeScript example](page/assets/SearchWithSuggestions.svg)

## License

[MIT](LICENSE) © 2026 Stefan Huber
