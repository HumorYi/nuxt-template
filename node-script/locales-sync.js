import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const rootDir = process.cwd()

const localesDir = path.join(rootDir, 'i18n', 'locales')
const sourceFileName = 'zh.js'
const sourceFile = path.join(localesDir, sourceFileName)

// 读取 locales 目录下的所有 .js 文件，过滤掉 sourceFile 对应的文件
const targetFiles = fs.readdirSync(localesDir, { withFileTypes: true })
  .filter(dirent => dirent.isFile() && dirent.name.endsWith('.js') && dirent.name !== sourceFileName)
  .map(dirent => path.join(localesDir, dirent.name))

const regExportDefault = /export default\s+(.*)/s
const regSemicolonEnd = /;\s*$/

function log(text) {
  console.log(`sync-locales.js: ${text}`)
}

// 读取文件内容并解析为对象
function readFileContent(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const match = fileContent.match(regExportDefault)
    if (match && match[1]) {
      const contentStr = match[1].replace(regSemicolonEnd, '')
      // eslint-disable-next-line no-new-func
      return new Function(`return ${contentStr}`)()
    }
    return {}
  }
  catch (error) {
    log(`Error reading file ${filePath}: ${error.message}`)
    return {}
  }
}

// 写入对象到文件
function writeFileContent(filePath, content) {
  try {
    const fileContent = `export default ${JSON.stringify(content, null, 2)};`
    fs.writeFileSync(filePath, fileContent)
    log(`Updated file: ${filePath}`)
  }
  catch (error) {
    log(`Error writing file ${filePath}: ${error.message}`)
  }
}

// 递归同步对象内容
function syncObject(sourceObj, targetObj, fn) {
  Object.keys(sourceObj).forEach((key) => {
    if (!(key in targetObj)) {
      fn(sourceObj, targetObj, key)
    }
    else if (typeof sourceObj[key] === 'object' && typeof targetObj[key] === 'object') {
      syncObject(sourceObj[key], targetObj[key], fn)
    }
  })
}

// 同步单个目标文件
function syncTargetFile(targetFile) {
  const targetName = path.basename(targetFile)
  log(`Syncing to ${targetName}...`)

  // 构建完整的源数据对象
  const sourceData = readFileContent(sourceFile)

  // 读取目标文件内容
  const targetContent = readFileContent(targetFile)

  // 同步内容：保持相同 key 的值，添加新 key，删除不存在的 key
  const syncedContent = { ...targetContent }
  let isChanged = false

  // 增
  syncObject(sourceData, syncedContent, (sourceObj, targetObj, key) => {
    targetObj[key] = sourceObj[key]
    isChanged = true
  })

  // 删
  syncObject(syncedContent, sourceData, (sourceObj, targetObj, key) => {
    delete sourceObj[key]
    isChanged = true
  })

  if (isChanged) {
    // 写入同步后的内容
    writeFileContent(targetFile, syncedContent)
  }
}

// 开始同步
function startSync() {
  log('Starting to sync locales...')

  // 检查源目录是否存在
  if (!fs.existsSync(sourceFile)) {
    log(`Source directory ${sourceFile} does not exist!`)
    return
  }

  // 同步到每个目标文件
  targetFiles.forEach((targetFile) => {
    syncTargetFile(targetFile)
  })

  log('Sync completed!')
}

// 运行同步
startSync()
