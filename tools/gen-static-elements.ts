import ts from 'typescript'

export type HTMLElementTagNameMapEntry = {
  key: string
  elementType: string
}

const getPropertyNameText = (name: ts.PropertyName) => {
  if (
    ts.isIdentifier(name) ||
    ts.isStringLiteral(name) ||
    ts.isNumericLiteral(name)
  ) {
    return name.text
  }

  return name.getText()
}

const getHTMLElementTagNameMapInterface = (sourceFile: ts.SourceFile) => {
  const iface = sourceFile.statements.find(
    (statement: ts.Statement): statement is ts.InterfaceDeclaration =>
      ts.isInterfaceDeclaration(statement) &&
      statement.name.text === 'HTMLElementTagNameMap',
  )

  if (!iface) {
    throw new Error('HTMLElementTagNameMap interface not found')
  }

  return iface
}

const getDefaultDomLibPath = () => {
  const typescriptModuleUrl = import.meta.resolve('typescript')
  return new URL('./lib.dom.d.ts', typescriptModuleUrl)
}

export const getHTMLElementTagNameMapEntries = (opts?: {
  domGeneratedDtsPath?: string | URL
}): HTMLElementTagNameMapEntry[] => {
  const domGeneratedDtsPath =
    opts?.domGeneratedDtsPath ?? getDefaultDomLibPath()

  const content = Deno.readTextFileSync(domGeneratedDtsPath)
  const sourceFile = ts.createSourceFile(
    'lib.dom.d.ts',
    content,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS,
  )
  const iface = getHTMLElementTagNameMapInterface(sourceFile)

  return iface.members.flatMap((member: ts.TypeElement) => {
    if (!ts.isPropertySignature(member) || !member.type) {
      return []
    }

    const key = getPropertyNameText(member.name)
    const elementType = member.type.getText(sourceFile).trim()
    return { key, elementType }
  })
}

const classTemplate = (tagName: string) =>
  `export class ${tagName} extends defineStaticElementTag('${tagName}') {}\n`

const targetDir = './generated'

if (import.meta.main) {
  const entries = getHTMLElementTagNameMapEntries()
  let allClasses = ''
  allClasses += `import { defineStaticElementTag } from "../src/define-tag.ts"\n\n`

  allClasses += `export const SUPPORTED_HTML_TAGS = [${entries.map((tag) => `'${tag.key}'`).join(', ')}]\n`

  allClasses += entries
    .filter((tag) => !['object', 'var'].includes(tag.key))
    .map((tag) => classTemplate(tag.key))
    .join('')

  Deno.writeFileSync(
    `${targetDir}/__generated-static-elements.ts`,
    new TextEncoder().encode(allClasses),
  )
  console.log(JSON.stringify(entries, null, 2))
}
