import fs from 'node:fs/promises'
import path from 'node:path'
import glob from 'fast-glob'
import esbuild from 'esbuild'
import { execa } from 'execa'
import { dirname, exists } from './utils.js'

// Paths
const __dirname = dirname(import.meta)
const root = path.resolve(__dirname, '..')

const packageJson: Record<string, any> = JSON.parse(
  await fs.readFile(path.resolve(root, 'package.json'), 'utf-8'),
)
const projectJson: Record<string, any> = JSON.parse(
  await fs.readFile(path.resolve(root, 'project.config.json'), 'utf-8'),
)

// ESBuild
esbuild.build({
  entryPoints: glob.sync(`${projectJson.srcMiniprogramRoot}/**/*.ts`, {
    cwd: root,
  }),
  outdir: './dist/',
  outbase: '',
  define: {
    __appId: JSON.stringify(projectJson.appid),
    __version: JSON.stringify(packageJson.version),
    __apiRoot: JSON.stringify('https://strapi.ganfans.com/api/'),
  },
})

// Copy files w/o `.ts` extension
const files = glob.sync([`**/*`, '!**/*.ts'], {
  cwd: projectJson.srcMiniprogramRoot,
})
for (const file of files) {
  const dir = path.resolve('dist', path.dirname(file))
  if (!(await exists(dir))) {
    await fs.mkdir(dir, { recursive: true })
  }
  await execa('cp', [
    `${projectJson.srcMiniprogramRoot}${file}`,
    `dist/${path.dirname(file)}`,
  ])
}

// Unocss
execa('unocss', [
  'src/**/*.wxml',
  '--out-file',
  'src/unocss.wxss',
]).stdout?.pipe(process.stdout)
