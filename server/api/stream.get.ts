import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { sendStream } from 'h3'

export default defineEventHandler((event) => {
  const rootDir = process.cwd()

  const filePath = path.resolve(rootDir, 'server/api/stream.get.ts')

  return sendStream(event, fs.createReadStream(filePath))
})
