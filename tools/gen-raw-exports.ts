/**
 * Generates `generated/__generated-examples.ts` — a single record of raw
 * example source strings keyed by name.
 *
 * Multiple examples per file: use named markers in the source file:
 *
 *   // example-start: MyExample
 *   export const MyExample = () => component(...)
 *   // example-end: MyExample
 *
 * Both markers are optional per region (omitting start = from top of file,
 * omitting end = to bottom of file). Without any markers the whole file is
 * used as one entry, keyed by `name` in the config or the filename stem.
 *
 * Usage:
 *   deno run -A ./tools/gen-raw-exports.ts
 *
 * Configuration: edit the `files` array below.
 */

// ---------------------------------------------------------------------------
// Built-in named transforms — compose them per extracted region as needed
// ---------------------------------------------------------------------------
const transforms = {
  removeBiomeIgnoreComments: (s: string) =>
    s.replace(/^\s*\/\/\s*biome-ignore.+\n?/gm, ''),

  adjustMarklessImport: (s: string) =>
    s.replace(/['"].*?\/src\/index\.ts['"]/g, "'@huberst/markless'"),
} satisfies Record<string, (s: string) => string>

type Transform = keyof typeof transforms | ((s: string) => string)

type FileConfig = {
  /** Path relative to the project root */
  path: string
  /**
   * Fallback key when no named markers are present in the file.
   * Defaults to the filename stem.
   */
  name?: string
  /** Transforms applied to each extracted region, in order */
  transforms?: Transform[]
  /**
   * Append `renderToDom(document.body, <Name>())` to matching regions.
   * Pass an array of names or `true` to apply to all regions in this file.
   */
  renderToDom?: string[] | true
}

// ---------------------------------------------------------------------------
// Configuration — add or remove entries as needed
// ---------------------------------------------------------------------------

const defaultTransforms: Transform[] = [
  'removeBiomeIgnoreComments',
  'adjustMarklessImport',
]

const files: FileConfig[] = [
  {
    path: './examples/basic/basic-usage.ts',
    transforms: defaultTransforms,
  },
  {
    path: './examples/basic/minimal-todo.ts',
    transforms: defaultTransforms,
  },
  {
    path: './examples/basic/main-page-example.ts',
    transforms: defaultTransforms,
    renderToDom: ['SearchWithSuggestions'],
  },
]

/** Path of the consolidated output file, relative to the project root */
const outputFile = './generated/__generated-examples.ts'

// ---------------------------------------------------------------------------

const GENERATED_BANNER = `// ⚠️  AUTO-GENERATED — do not edit by hand.
// Run \`deno task generate-raw\` to regenerate.
// Source: tools/gen-raw-exports.ts
`

const escapeBacktick = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')

/** Extract all named `// example-start: Name` … `// example-end: Name` regions.
 *  Falls back to the full file content keyed by `fallbackName` when none found. */
const extractRegions = (
  content: string,
  fallbackName: string,
): Array<{ name: string; code: string }> => {
  const startRe = /\/\/ example-start:\s*(\w+)/g
  const regions: Array<{ name: string; code: string }> = []
  let match: RegExpExecArray | null

  while ((match = startRe.exec(content)) !== null) {
    const name = match[1]
    const codeStart = match.index + match[0].length
    const endMarker = `// example-end: ${name}`
    const endIdx = content.indexOf(endMarker, codeStart)
    const code =
      endIdx !== -1
        ? content.slice(codeStart, endIdx).trim()
        : content.slice(codeStart).trim()
    regions.push({ name, code })
  }

  return regions.length > 0
    ? regions
    : [{ name: fallbackName, code: content.trim() }]
}

const projectRoot = new URL('../', import.meta.url)
const entries: Array<{ key: string; value: string; sourcePath: string }> = []

for (const config of files) {
  const fallbackName =
    config.name ?? config.path.replace(/^.*\//, '').replace(/\.ts$/, '')
  const srcUrl = new URL(config.path, projectRoot)
  const raw = await Deno.readTextFile(srcUrl)
  const regions = extractRegions(raw, fallbackName)

  for (const { name, code } of regions) {
    let content = code

    for (const t of config.transforms ?? []) {
      const fn = typeof t === 'function' ? t : transforms[t]
      content = fn(content)
    }

    const shouldAddRenderToDom =
      config.renderToDom === true ||
      (Array.isArray(config.renderToDom) && config.renderToDom.includes(name))

    if (shouldAddRenderToDom) {
      content += `\n\nrenderToDom(document.body, ${name}())`
    }

    entries.push({ key: name, value: content, sourcePath: config.path })
  }
}

// Group named exports by source file for import statements
// outputFile is always './generated/__generated-examples.ts'
// so relative imports from there are '../' + path without leading './'
const importsByFile = new Map<string, string[]>()
for (const { key, sourcePath } of entries) {
  const list = importsByFile.get(sourcePath) ?? []
  list.push(key)
  importsByFile.set(sourcePath, list)
}

const importLines = [...importsByFile.entries()]
  .map(([srcPath, names]) => {
    const rel = '../' + srcPath.replace(/^\.\//, '')
    return `import { ${names.join(', ')} } from '${rel}'`
  })
  .join('\n')

const recordEntries = entries
  .map(
    ({ key, value }) =>
      `  ${key}: { raw: \`${escapeBacktick(value)}\`, toRender: ${key} }`,
  )
  .join(',\n\n')

const output = `${GENERATED_BANNER}
${importLines}

export const rawExamples = {
${recordEntries},
}
`

const outUrl = new URL(outputFile, projectRoot)
await Deno.writeTextFile(outUrl, output)
console.log(`Generated: ${outUrl.pathname}`)
console.log(`  Keys: ${entries.map((e) => e.key).join(', ')}`)
console.log('Done.')
