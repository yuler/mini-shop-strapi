import path from 'node:path'
import fs from 'node:fs/promises'

import glob from 'fast-glob'

import { dirname } from './utils'

// Paths
const __dirname = dirname(import.meta)
const root = path.resolve(__dirname, '..')

try {
  // Remove `src/miniprogram_npm` directory
  await fs.rmdir(path.resolve(root, 'src/miniprogram_npm'), {
    recursive: true,
  })
  // Remove `src/**/*.js` file
  const files = glob.sync('src/**/*.js', { cwd: root })
  for (const file of files) {
    await fs.rm(file)
  }
} catch {} // ignore
