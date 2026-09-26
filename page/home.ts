import {
  ReactiveColorSelection,
  UsingElements,
  UsingElementsNesting,
} from '../examples/basic/basic-usage.ts'
import { SearchWithSuggestions } from '../examples/basic/main-page-example.ts'
import { MinimalTodo } from '../examples/basic/minimal-todo.ts'
import {
  _EACH,
  code,
  component,
  h2,
  hgroup,
  li,
  type MarkLess,
  p,
  section,
  span,
  strong,
  ul,
} from '../src/index.ts'
import { CodeBlock, CodeBlockWithResult } from './code-block.ts'
import { Logo } from './logo.ts'
import type { menuWithIds } from './main.ts'

const Hero = () =>
  component(
    // biome-ignore format: custom layout needed
    (): MarkLess =>
      section.attr("id", "Mission").class("hero container")._([
        hgroup._([
          Logo(),
          p._("Plain TypeScript - Reactive - UI Components"),
        ]),
      ]),
  )

const Heading = (id: keyof typeof menuWithIds, text: string) =>
  component(() => h2.attr('id', id)._(text))

export const HomePage = () =>
  component(
    (): MarkLess => [
      Hero(),

      h2._('The Mission: HTML-level scannability, pure TS'),
      p._(
        `
        markless is a library which allows you to build UI for the
        browser, with a dev experience somewhat similar to React,
        `,
        span.class('highlight')._(`
            But without having to leave or enhance TypeScript-Land.
          `),
      ),
      p._(`
        The biggest hurdle was to achieve a visual distinction of HTML elements from the rest of the syntax. Because that is what XML and thus HTML and JSX are so strong at: You can quickly grasp the structure of the document.
      `),
      p._(`
        First I tried to make the HTML elements visually striking, by using underscores or special characters, like
        in these examples:
      `),
      // biome-ignore format: custom layout needed
      ul._(
        li._("_div_"),
        li._("__div__"),
        li._("$_div"),
        li._("$_DIV"),
      ),
      p._(
        `
        But none of these really helped scanning a component as quickly with your eyes, as you can with HTML / JSX.
      `,
      ),
      p._(
        `
        Then I found a little trick to make it work: `,
        span
          .class('highlight')
          ._(
            'Using static members on classes, with one class for each HTML element!',
          ),
      ),
      p._(
        `
        Most themes for syntax highlighting will highlight classes noticeably different,
        so they are easy to spot for your eyes. In VS Code Dark Modern, for example, they are
        colored in a green or almost turquoise color`,
        span.class('highlight')._(' ■ '),
        `which is also used for type information.
      `,
      ),

      CodeBlockWithResult({
        codeId: 'UsingElements',
        toRender: UsingElements,
      }),

      CodeBlockWithResult({
        codeId: 'UsingElementsNesting',
        toRender: UsingElementsNesting,
      }),

      Heading('Install', 'How to install'),
      p._('Add markless to a Deno project from JSR:'),
      CodeBlock('deno add jsr:@huberst/markless'),
      p._('Or install it from npm:'),
      CodeBlock('npm install @huberst/markless'),

      Heading('Benefits', 'What are the benefits of this approach?'),
      ul._(
        _EACH([
          'No need for a template language syntax like JSX, lit-html, or similar and their overhead.',
          'Therefore no editor / IDE extension for that syntax.',
          'No extra type-checking logic for that syntax.',
          'No build step required to transform that syntax into JS/TS.',
          'No virtual DOM.',
          'No magic.',
        ]).DO((item) => li._(item)),
      ),

      Heading('ElementAPI', 'Element API'),
      ul._(
        li._(
          strong._('Content: '),
          code._('._(...)'),
          ' adds text, elements, and components as children.',
        ),
        li._(
          strong._('Properties: '),
          code._(".prop('value', value)"),
          ' and ',
          code._('.propSet({ checked: true })'),
          ` assign DOM properties, including reactive values. Names and values
          are checked against the element's DOM type.`,
        ),
        li._(
          strong._('Attributes: '),
          code._(".attr('aria-label', 'Close')"),
          ' and ',
          code._(".attrSet({ viewBox: '0 0 100 100' })"),
          ` set HTML or SVG attributes, including reactive values. Attribute
          names are strings because TypeScript's DOM types do not list attributes
          by tag. On an element description, `,
          code._(".dataAttr('state', 'open')"),
          ' is shorthand for ',
          code._('data-state'),
          '.',
        ),
        li._(
          strong._('Appearance: '),
          code._(".class('active', activeClass)"),
          ' adds static or reactive classes. ',
          code._(".style({ color: 'red' })"),
          ` sets inline styles; a reactive style object also removes declarations
          that disappear on subsequent updates.`,
        ),
        li._(
          strong._('Interaction and lifecycle: '),
          code._(".event('click', handler)"),
          ' registers a handler; ',
          code._('.setRef(callback)'),
          ' provides a typed DOM element reference. ',
          code._('.afterMount(callback)'),
          ' and ',
          code._('.onRemove(callback)'),
          ' run on mounting and removal.',
        ),
      ),

      Heading('Reactivity', 'But what about reactivity?'),

      p._(`
        markless components never 're-render' in the sense of React or Vue.
        All updates are driven by reactive adapters, which can be built on top of
        any reactive source you like. Reactive adapters for preact signals and RxJS
        are already included. They are easy to integrate.
      `),

      CodeBlockWithResult({
        codeId: 'ReactiveColorSelection',
        toRender: ReactiveColorSelection,
      }),

      Heading('Todo', 'Of course there is a todo app example 🙄'),
      CodeBlockWithResult({
        codeId: 'MinimalTodo',
        toRender: MinimalTodo,
      }),

      Heading('Mixing', 'Mixing multiple reactive sources'),
      CodeBlockWithResult({
        codeId: 'SearchWithSuggestions',
        toRender: SearchWithSuggestions,
      }),
    ],
  )
