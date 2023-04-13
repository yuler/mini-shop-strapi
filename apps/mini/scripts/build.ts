import fs from 'node:fs/promises'
import path from 'node:path'
import glob from 'fast-glob'
import esbuild from 'esbuild'
import { execa } from 'execa'

import { dirname } from './utils.js'

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
  entryPoints: glob.sync('src/**/*.ts', { cwd: root }),
  outdir: '.',
  outbase: '.',
  define: {
    __appId: JSON.stringify(projectJson.appid),
    __version: JSON.stringify(packageJson.version),
    __apiRoot: JSON.stringify('https://strapi.ganfans.com/api/'),
  },
})

// Unocss
execa('unocss', [
  'src/**/*.wxml',
  '--out-file',
  'src/unocss.wxss',
]).stdout?.pipe(process.stdout)
