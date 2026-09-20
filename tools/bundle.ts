// The deno-loader plugin resolves 'http', 'https', and 'jsr' imports for esbuild
import { denoPlugin } from '@deno/esbuild-plugin'
import esbuild from 'esbuild'

try {
  await Deno.remove('./dist', { recursive: true })
} catch (e) {
  console.error(e)
}

const _bundleSplit = async () => {
  await esbuild.build({
    plugins: [denoPlugin()],
    entryPoints: ['./src'],
    outdir: './dist',
    splitting: true,
    bundle: true,

    format: 'esm',
  })

  console.log('Build complete!')
  esbuild.stop()
}

const bundleSingle = async () => {
  await esbuild.build({
    plugins: [denoPlugin()],
    entryPoints: ['./src/index.ts'],
    outfile: './dist/bundle.js',
    bundle: true,
    // sourcemap: 'inline',
    minify: true,
    minifyIdentifiers: true,

    format: 'esm',
  })

  console.log('Build complete!')
  esbuild.stop()
}

await bundleSingle()

const duCmd = new Deno.Command('du', {
  args: ['-ahA', './dist'],
  stdout: 'inherit',
  stderr: 'inherit',
})
await duCmd.output()
