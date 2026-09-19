import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const dist = resolve('dist')
const source = await readFile(resolve(dist, 'index.html'), 'utf8')
const styleMatch = source.match(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/)
const scriptMatch = source.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/)

if (!styleMatch || !scriptMatch) throw new Error('Cannot find Vite CSS or JavaScript assets')

const assetPath = value => resolve(dist, value.replace(/^\//, ''))
const css = await readFile(assetPath(styleMatch[1]), 'utf8')
const javascript = await readFile(assetPath(scriptMatch[1]), 'utf8')
const encoded = Buffer.from(javascript, 'utf8').toString('base64')
const loader = `<script>
(() => {
  const bytes = Uint8Array.from(atob('${encoded}'), character => character.charCodeAt(0))
  const moduleScript = document.createElement('script')
  moduleScript.type = 'module'
  moduleScript.textContent = new TextDecoder().decode(bytes)
  document.head.appendChild(moduleScript)
})()
</script>`

const standalone = source
  .replace(/\s*<link rel="manifest"[^>]*>/, '')
  .replace(/\s*<link rel="icon"[^>]*>/, '')
  .replace(styleMatch[0], `<style>\n${css}\n</style>`)
  .replace(scriptMatch[0], loader)
  .replace('</head>', '    <meta name="fuxiang-build" content="standalone-v1.0.3" />\n  </head>')

const output = resolve(process.argv[2] || '浮想_浏览器版.html')
await writeFile(output, standalone, 'utf8')
console.log(`Standalone browser app created: ${output}`)
