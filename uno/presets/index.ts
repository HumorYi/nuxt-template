import type { Preset } from 'unocss'
import { FileOptionType, getFilePaths } from '../../app/utils/file.js'

// 因为 uno 是以插件方式注入到 vite 中，vite 中的 import.meta.glob 使用不了，所以只能用 Node 的方式来获取文件
const presets: Preset[] = getFilePaths({
  dir: new URL('.', import.meta.url).pathname,
  excludes: ['index.ts'],
  includeSuffixList: ['ts'],
  type: FileOptionType.FILE_KEY,
}).map(file => (typeof file === 'function' ? file() : file))

export default presets
