/** Create the ignored Vite configuration from the running local Supabase stack. */
import { execFileSync } from 'node:child_process'
import { chmodSync, writeFileSync } from 'node:fs'

const parseEnv = (output) => Object.fromEntries(
  output
    .split('\n')
    .map((line) => line.match(/^([A-Z0-9_]+)=(?:"(.*)"|(.*))$/))
    .filter(Boolean)
    .map((match) => [match[1], match[2] ?? match[3]]),
)

let status

try {
  status = execFileSync('npx', ['supabase', 'status', '-o', 'env'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
} catch {
  console.error('Unable to read the local Supabase status. Start the stack first.')
  process.exit(1)
}

const values = parseEnv(status)
const apiUrl = values.API_URL
const publishableKey = values.PUBLISHABLE_KEY ?? values.ANON_KEY

if (!apiUrl || !publishableKey) {
  console.error('The local Supabase status did not provide the required browser configuration.')
  process.exit(1)
}

writeFileSync(
  '.env.local',
  `VITE_SUPABASE_URL=${apiUrl}\nVITE_SUPABASE_PUBLISHABLE_KEY=${publishableKey}\n`,
  { mode: 0o600 },
)
chmodSync('.env.local', 0o600)
console.log('Created .env.local with local browser configuration; values were not printed.')
