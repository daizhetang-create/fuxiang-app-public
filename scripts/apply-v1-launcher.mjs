import { readFile, writeFile } from 'node:fs/promises'

const file = 'vite.config.ts'
let source = await readFile(file, 'utf8')
const before = `  server: { port: 4173 },`
const after = `  server: { port: 4173, strictPort: true },\n  preview: { port: 4173, strictPort: true },`
if (!source.includes(before)) throw new Error(`${file}: replacement target not found`)
source = source.replace(before, after)
await writeFile(file, source, 'utf8')
console.log(`updated ${file}`)
