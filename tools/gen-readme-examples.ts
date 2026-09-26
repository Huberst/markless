/** Generate GitHub-friendly, highlighted SVGs from the home page examples. */
import { createHighlighter } from 'shiki'
import {
  isMarklessElement,
  MARKLESS_ELEMENT_COLOR,
} from '../page/element-highlight.ts'
import { readExampleSources } from './example-sources.ts'

const exampleNames = [
  'UsingElements',
  'UsingElementsNesting',
  'ReactiveColorSelection',
  'MinimalTodo',
  'SearchWithSuggestions',
] as const

const fontSize = 16
const lineHeight = 25
const padding = 24
const charWidth = 9.6 // 16px monospace font

const xmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
}
const escapeXml = (text: string) =>
  text.replace(/[&<>"']/g, (ch) => xmlEntities[ch])

const highlighter = await createHighlighter({
  themes: ['dark-plus'],
  langs: ['typescript'],
})
const sources = new Map(
  (await readExampleSources()).map(({ key, value }) => [key, value]),
)
const assetRoot = new URL('../page/assets/', import.meta.url)

for (const name of exampleNames) {
  const code = sources.get(name)
  if (code === undefined) throw new Error(`Missing example: ${name}`)

  const { tokens, bg, fg } = highlighter.codeToTokens(code, {
    lang: 'typescript',
    theme: 'dark-plus',
  })
  const lines = code.split('\n')
  if (
    tokens.length !== lines.length ||
    tokens.some((line, i) =>
      line.map((token) => token.content).join('') !== lines[i]
    )
  ) {
    throw new Error(`Shiki did not preserve every line of ${name}`)
  }
  // Account for wide characters (e.g. the emoji in the todo example).
  const columns = (line: string) =>
    [...line].reduce((n, ch) => n + (ch.codePointAt(0)! > 0x2e80 ? 2 : 1), 0)
  const width = Math.ceil(
    Math.max(...lines.map(columns)) * charWidth + 2 * padding,
  )
  const height = lines.length * lineHeight + 2 * padding

  const text = tokens.map((line, index) => {
    const spans = line.map((token) => {
      const element = isMarklessElement(token.content)
      // Keep the indentation outside bold element spans, as on the home page.
      const leading = element ? token.content.match(/^[ \t]+/)?.[0] ?? '' : ''
      const word = token.content.slice(leading.length)
      const color = element ? MARKLESS_ELEMENT_COLOR : token.color ?? fg
      const fontStyle = token.fontStyle ?? 0
      const style = fontStyle & 1 ? ' font-style="italic"' : ''
      const weight = element || fontStyle & 2 ? ' font-weight="bold"' : ''
      return `${escapeXml(leading)}<tspan fill="${color}"${style}${weight}>${
        escapeXml(word)
      }</tspan>`
    }).join('')
    return `  <text x="${padding}" y="${
      padding + fontSize + index * lineHeight
    }" xml:space="preserve">${spans}</text>`
  }).join('\n')

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${name} TypeScript example">
  <rect width="100%" height="100%" fill="${bg}"/>
  <g font-family="'DejaVu Sans Mono', Menlo, Consolas, monospace" font-size="${fontSize}" fill="${fg}">
${text}
  </g>
</svg>
`
  await Deno.writeTextFile(new URL(`${name}.svg`, assetRoot), svg)
  console.log(`Generated page/assets/${name}.svg`)
}
