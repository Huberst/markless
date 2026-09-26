/**
 * Generates `page/generated/__generated-examples.ts` — a single record of raw
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
 * Configuration: edit the `files` array in `tools/example-sources.ts`.
 */

import { readExampleSources } from './example-sources.ts'

/** Path of the consolidated output file, relative to the project root */
const outputFile = './page/generated/__generated-examples.ts'

// ---------------------------------------------------------------------------

const GENERATED_BANNER = `// ⚠️  AUTO-GENERATED — do not edit by hand.
// Run \`deno task gen-example-strings\` to regenerate.
// Source: tools/gen-raw-exports.ts
`

const escapeBacktick = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')

const projectRoot = new URL('../', import.meta.url)
const entries = await readExampleSources()

// Group named exports by source file for import statements
// outputFile is always './page/generated/__generated-examples.ts'
// so relative imports from there are '../../' + path without leading './'
const importsByFile = new Map<string, string[]>()
for (const { key, sourcePath } of entries) {
  const list = importsByFile.get(sourcePath) ?? []
  list.push(key)
  importsByFile.set(sourcePath, list)
}

const importLines = [...importsByFile.entries()]
  .map(([srcPath, names]) => {
    const rel = '../../' + srcPath.replace(/^\.\//, '')
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
