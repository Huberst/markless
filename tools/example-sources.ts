/** Shared source extraction for the home page and README code examples. */

const transforms = {
  removeBiomeIgnoreComments: (s: string) =>
    s.replace(/^\s*\/\/\s*biome-ignore.+\n?/gm, ''),

  adjustMarklessImport: (s: string) =>
    s.replace(/['"].*?\/src\/index\.ts['"]/g, "'@huberst/markless'"),
} satisfies Record<string, (s: string) => string>

type Transform = keyof typeof transforms | ((s: string) => string)

type FileConfig = {
  path: string
  name?: string
  transforms?: Transform[]
  renderToDom?: string[] | true
}

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

/** Extract named `// example-start: Name` … `// example-end: Name` regions. */
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
    const code = endIdx !== -1
      ? content.slice(codeStart, endIdx).trim()
      : content.slice(codeStart).trim()
    regions.push({ name, code })
  }

  return regions.length > 0
    ? regions
    : [{ name: fallbackName, code: content.trim() }]
}

export type ExampleSource = { key: string; value: string; sourcePath: string }

export const readExampleSources = async (): Promise<ExampleSource[]> => {
  const projectRoot = new URL('../', import.meta.url)
  const entries: ExampleSource[] = []

  for (const config of files) {
    const fallbackName = config.name ??
      config.path.replace(/^.*\//, '').replace(/\.ts$/, '')
    const raw = await Deno.readTextFile(new URL(config.path, projectRoot))

    for (const { name, code } of extractRegions(raw, fallbackName)) {
      let content = code
      for (const t of config.transforms ?? []) {
        const fn = typeof t === 'function' ? t : transforms[t]
        content = fn(content)
      }

      if (
        config.renderToDom === true ||
        (Array.isArray(config.renderToDom) && config.renderToDom.includes(name))
      ) {
        content += `\n\nrenderToDom(document.body, ${name}())`
      }

      entries.push({ key: name, value: content, sourcePath: config.path })
    }
  }

  return entries
}
