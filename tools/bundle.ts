import esbuild from 'esbuild'
import ts from 'typescript'

try {
  await Deno.remove('./dist', { recursive: true })
} catch (error) {
  if (!(error instanceof Deno.errors.NotFound)) throw error
}

try {
  await Promise.all([
    esbuild.build({
      entryPoints: ['./src/index.ts'],
      outfile: './dist/bundle.js',
      bundle: true,
      minify: true,
      format: 'esm',
      target: 'es2022',
      sourcemap: true,
    }),
    emitDeclarations(),
  ])

  console.log('Build complete!')
} finally {
  esbuild.stop()
}

function emitDeclarations() {
  const program = ts.createProgram({
    rootNames: ['./src/index.ts'],
    options: {
      allowImportingTsExtensions: true,
      declaration: true,
      declarationDir: './dist',
      emitDeclarationOnly: true,
      lib: ['lib.dom.d.ts', 'lib.es2024.d.ts'],
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      rootDir: '.',
      target: ts.ScriptTarget.ES2022,
    },
  })

  const result = program.emit()
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(result.diagnostics)

  if (diagnostics.length > 0) {
    throw new Error(
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: (fileName) => fileName,
        getCurrentDirectory: () => Deno.cwd(),
        getNewLine: () => '\n',
      }),
    )
  }
}
