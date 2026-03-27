import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const rootDir = process.cwd()

const sourceDir = path.join(rootDir, 'i18n/locales/zh-Hans')
const targetDirs = [
  path.join(rootDir, 'i18n/locales/en'),
  path.join(rootDir, 'i18n/locales/zh-Hant-HK'),
]

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

// 确保目录存在
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    log(`Created directory: ${dirPath}`)
  }
}

// 递归同步文件
function syncFiles(sourcePath, targetPath) {
  const sourceStats = fs.statSync(sourcePath)

  if (sourceStats.isDirectory()) {
    // 确保目标目录存在
    ensureDir(targetPath)

    // 读取源目录下的所有文件
    const files = fs.readdirSync(sourcePath)

    files.forEach((file) => {
      const sourceFile = path.join(sourcePath, file)
      const targetFile = path.join(targetPath, file)
      syncFiles(sourceFile, targetFile)
    })
  }
  else if (sourceStats.isFile() && path.extname(sourcePath) === '.js') {
    // 读取源文件内容
    const sourceContent = readFileContent(sourcePath)

    if (!fs.existsSync(targetPath)) {
      writeFileContent(targetPath, sourceContent)
      return
    }

    const targetContent = readFileContent(targetPath)

    // 同步内容：保持相同 key 的值，添加新 key，删除不存在的 key
    const syncedContent = { ...targetContent }
    let isChanged = false

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

    // 增
    syncObject(sourceContent, syncedContent, (sourceObj, targetObj, key) => {
      targetObj[key] = sourceObj[key]
      isChanged = true
    })

    // 删
    syncObject(syncedContent, sourceContent, (sourceObj, targetObj, key) => {
      delete sourceObj[key]
      isChanged = true
    })

    if (isChanged) {
      // 写入同步后的内容
      writeFileContent(targetPath, syncedContent)
    }
  }
}

// 开始同步
function startSync() {
  log('Starting to sync locales...')

  // 检查源目录是否存在
  if (!fs.existsSync(sourceDir)) {
    log(`Source directory ${sourceDir} does not exist!`)
    return
  }

  // 同步到每个目标目录
  targetDirs.forEach((targetDir) => {
    log(`Syncing to ${path.basename(targetDir)}...`)
    syncFiles(sourceDir, targetDir)
  })

  log('Sync completed!')
}

// 运行同步
startSync()
