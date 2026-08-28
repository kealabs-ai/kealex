import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const svg = readFileSync(resolve(root, 'public', 'og-image.svg'))

await sharp(svg)
  .resize(1200, 630)
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(resolve(root, 'public', 'og-image.jpg'))

console.log('✅  public/og-image.jpg gerado com sucesso (1200×630, JPEG 92%)')
