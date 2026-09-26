import { SUPPORTED_HTML_TAGS } from '../generated/__generated-static-elements.ts'

// VS Code Dark Modern semantic class color — Shiki only provides syntax tokens.
const marklessElements = new Set(
  // SUPPORTED_HTML_TAGS.filter((tag) => tag !== 'body' && tag !== 'map'),
  SUPPORTED_HTML_TAGS.filter(
    (tag) => ['body', 'map', 'style'].includes(tag) === false,
  ),
)

export const isMarklessElement = (token: string) =>
  marklessElements.has(token.trim())

export const MARKLESS_ELEMENT_COLOR = '#4EC9B0'
