import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const BG = [0x25, 0x63, 0xeb, 255]
const WHITE = [255, 255, 255, 255]

function inRoundRect(x, y, cx, cy, w, h, r) {
  const dx = Math.max(Math.abs(x - cx) - (w / 2 - r), 0)
  const dy = Math.max(Math.abs(y - cy) - (h / 2 - r), 0)
  return dx * dx + dy * dy <= r * r
}

function pixel(size, x, y) {
  const cx = size / 2
  const s = size / 512

  const bar = inRoundRect(x, y, cx, size * 0.5, 288 * s, 36 * s, 18 * s)
  const plateL = inRoundRect(x, y, size * 0.172, size * 0.5, 48 * s, 160 * s, 14 * s)
  const plateR = inRoundRect(x, y, size * 0.828, size * 0.5, 48 * s, 160 * s, 14 * s)

  if (bar || plateL || plateR) return WHITE
  if (inRoundRect(x, y, cx, cx, size, size, 96 * s)) return BG
  return [0, 0, 0, 0]
}

const crcTable = (() => {
  const table = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function writePng(size, filePath) {
  const raw = Buffer.alloc(size * (1 + size * 4))
  let off = 0
  for (let y = 0; y < size; y++) {
    raw[off++] = 0
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixel(size, x, y)
      raw[off++] = r
      raw[off++] = g
      raw[off++] = b
      raw[off++] = a
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
  fs.writeFileSync(filePath, png)
  console.log(`generated ${filePath} (${size}x${size})`)
}

const outDir = path.resolve('public', 'icons')
fs.mkdirSync(outDir, { recursive: true })
writePng(192, path.join(outDir, 'icon-192.png'))
writePng(512, path.join(outDir, 'icon-512.png'))
