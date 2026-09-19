import { access, readFile, readdir } from 'node:fs/promises'
import { extname, join } from 'node:path'

const required = [
  'src/App.tsx', 'src/styles.css', 'api/organize.mjs', 'api/transcribe.mjs',
  'supabase/schema.sql', 'vercel.json', '.env.example', 'public/manifest.webmanifest',
]

const failures = []
for (const file of required) {
  try { await access(file) } catch { failures.push(`缺少 ${file}`) }
}

const packageJson = JSON.parse(await readFile('package.json', 'utf8'))
if (packageJson.version !== '1.0.3') failures.push('package.json 版本不是 1.0.3')

async function scan(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (['node_modules', 'dist', '.git', '.vercel'].includes(entry.name)) continue
    const file = join(dir, entry.name)
    if (entry.isDirectory()) await scan(file)
    else if (['.ts', '.tsx', '.js', '.mjs', '.json', '.md', '.html', '.sql'].includes(extname(file)) || entry.name.startsWith('.env')) {
      const content = await readFile(file, 'utf8')
      if (/sk-[a-z0-9]{20,}/i.test(content)) failures.push(`${file} 疑似包含真实 API 密钥`)
    }
  }
}

await scan('.')

if (failures.length) {
  console.error('配置检查失败：')
  failures.forEach(item => console.error(`- ${item}`))
  process.exit(1)
}

console.log('配置检查通过：文件齐全、版本正确、源码未发现 API 密钥。')
