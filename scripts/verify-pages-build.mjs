import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? filesUnder(path) : [path]
  }))
  return nested.flat()
}

const index = await readFile('dist/index.html', 'utf8')
if (!index.includes('/routine-tracker/assets/')) {
  throw new Error('The Pages build does not use the /routine-tracker/ asset base.')
}

const files = await filesUnder('dist')
const forbidden = ['127.0.0.1:54321', 'localhost:54321']
try {
  const localEnvironment = await readFile('.env.local', 'utf8')
  for (const line of localEnvironment.split(/\r?\n/)) {
    const separator = line.indexOf('=')
    if (separator < 0) continue
    const name = line.slice(0, separator)
    const value = line.slice(separator + 1).trim()
    if (['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'].includes(name) && value) forbidden.push(value)
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}

for (const file of files) {
  const contents = await readFile(file)
  const text = contents.toString('utf8')
  const match = forbidden.find((marker) => text.includes(marker))
  if (match) throw new Error(`The guest artifact contains forbidden cloud configuration in ${file}.`)
}

console.log('GitHub Pages artifact uses the repository base path and contains no local Supabase configuration.')
