/* eslint-disable ts/no-require-imports */
/* eslint-disable unicorn/prefer-includes */
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const regFileExt = /\.([^./\\?#]*)(?=[?#]|$)/
const regFilename = /[^/\\?#]*(?=[?#]|$)/
const regFilenameWithoutExt = /(?!^\.)\.\w*$/

export enum FileOptionType {
  FILEPATH = 'filepath',
  FILE = 'file',
  FILE_KEY = 'default',
}

export interface FileOption {
  dir: string
  excludes?: string[]
  excludeSuffixList?: string[]
  includes?: string[]
  includeSuffixList?: string[]
  type?: FileOptionType
}

export function getFileExt(path: string) {
  return decodeURIComponent(path).match(regFileExt)?.[1]?.toLowerCase() || ''
}

export function getFilename(path: string) {
  return decodeURIComponent(path).match(regFilename)?.[0] || ''
}

export function getFilenameWithoutExt(path: string) {
  return getFilename(path).replace(regFilenameWithoutExt, '')
}

export function getFilePaths({
  dir,
  excludes,
  excludeSuffixList,
  includes,
  includeSuffixList,
  type = FileOptionType.FILEPATH,
}: FileOption) {
  return readdirRecursive(dir)
    .filter(
      filePath =>
        !excludes?.includes(filePath)
        || !excludeSuffixList?.some(suffix => getFileExt(filePath) === suffix)
        || includes?.includes(filePath)
        || includeSuffixList?.some(suffix => getFileExt(filePath) === suffix),
    )
    .map((filePath) => {
      switch (type) {
        case FileOptionType.FILE:
          return require(filePath)
        case FileOptionType.FILE_KEY:
          return require(filePath)[FileOptionType.FILE_KEY]

        default:
          return filePath
      }
    })
}

export function readdirRecursive(dir: string) {
  const entries = readdirSync(dir, { withFileTypes: true })
  const result: string[] = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)

    if (entry.isDirectory())
      result.push(...readdirRecursive(fullPath))
    else result.push(fullPath)
  }

  return result
}
