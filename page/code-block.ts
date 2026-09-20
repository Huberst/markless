import { createHighlighter } from 'shiki'
import { rawExamples } from '../generated/__generated-examples.ts'
import {
  component,
  div,
  type MarkLess,
  SUPPORTED_HTML_TAGS,
} from '../src/index.ts'

const DARK_THEME = 'dark-plus'

const highlighterPromise = createHighlighter({
  themes: ['dark-plus'],
  langs: ['typescript'],
})

const tagsToIgnoreHighlighting = ['body', 'map']

// VS Code Dark Modern semantic class color — applied to known markless element identifiers
// since Shiki only has syntactic tokens (no TS language server semantic info).
const marklessHighlightElements = new Set(
  SUPPORTED_HTML_TAGS.filter((tag) => !tagsToIgnoreHighlighting.includes(tag)),
)

export const CodeBlock = (example: string) =>
  component((): MarkLess => {
    const divEl = div.class('code-block').setRef((el) => {
      highlighterPromise.then((hl) => {
        const html = hl.codeToHtml(example, {
          lang: 'typescript',
          theme: DARK_THEME,
          transformers: [
            {
              span(node) {
                const firstChild = node.children[0]
                if (!firstChild || firstChild.type !== 'text') return
                if (marklessHighlightElements.has(firstChild.value.trim())) {
                  node.properties.style = undefined
                  node.properties.class = 'np-element'
                }
              },
            },
          ],
        })
        // Move leading whitespace out of .np-element spans so transform-origin
        // centers on the identifier text only, not the indentation.
        el.innerHTML = html.replace(
          /(<span [^>]*class="np-element"[^>]*>)([ \t]+)(\S+)(<\/span>)/g,
          (_full, open, ws, name, close) => `${ws}${open}${name}${close}`,
        )
      })
    })

    return divEl
  })

export const CodeBlockWithResult = (options: {
  codeId: keyof typeof rawExamples
  toRender: MarkLess
}) => {
  return component(
    (): MarkLess => [
      CodeBlock(rawExamples[options.codeId].raw),
      div.class('code-block-example-result')._(options.toRender),
    ],
  )
}
