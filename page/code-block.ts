import { createHighlighter } from 'shiki'
import { component, div, type MarkLess } from '../src/index.ts'
import { rawExamples } from './generated/__generated-examples.ts'
import { isMarklessElement } from './element-highlight.ts'

const DARK_THEME = 'dark-plus'

const highlighterPromise = createHighlighter({
  themes: ['dark-plus'],
  langs: ['typescript'],
})

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
                if (isMarklessElement(firstChild.value)) {
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
