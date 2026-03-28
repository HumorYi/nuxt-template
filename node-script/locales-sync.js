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

/**
 * 多层JSON扁平化
 * @param {object} data - 嵌套的JSON对象
 * @param {string} [parentKey] - 递归父级键（内部使用）
 * @param {string} [separator] - 键分隔符
 * @returns {object} 扁平化后的单层对象
 */
function flattenObject(data, parentKey = '', separator = '.') {
  // 存储扁平化结果
  const result = {}

  // 遍历对象/数组的所有键值对
  for (const [key, value] of Object.entries(data)) {
    // 拼接当前完整键名
    const currentKey = parentKey ? `${parentKey}${separator}${key}` : key

    // 判断值是否为 嵌套对象（需要递归）
    const isNested = typeof value === 'object' && value !== null

    if (isNested) {
      // 递归扁平化嵌套结构
      Object.assign(result, flattenObject(value, currentKey, separator))
    }
    else {
      // 基本类型（字符串/数字/布尔/null）直接赋值
      result[currentKey] = value
    }
  }

  return result
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
function syncObject(sourceObj, targetObj, fn, exist = false) {
  Object.keys(sourceObj).forEach((key) => {
    if (key in targetObj) {
      if (typeof sourceObj[key] === 'object' && typeof targetObj[key] === 'object') {
        syncObject(sourceObj[key], targetObj[key], fn)
      }
      else if (exist) {
        fn(sourceObj, targetObj, key)
      }
    }
    else {
      fn(sourceObj, targetObj, key)
    }
  })
}

function getExistVal(val, flatSourceData, flatTargetData) {
  if (typeof val === 'string') {
    const keys = []

    for (const [k, v] of Object.entries(flatSourceData)) {
      if (v === val) {
        keys.push(k)
      }
    }

    for (const k of keys) {
      if (flatTargetData[k]) {
        return flatTargetData[k]
      }
    }
  }
  else if (typeof val === 'object') {
    const result = JSON.parse(JSON.stringify(val))

    for (const [k, v] of Object.entries(result)) {
      result[k] = getExistVal(v, flatSourceData, flatTargetData)
    }

    return result
  }

  return val
}

// 同步单个目标文件
function syncTargetFile(targetFile) {
  const targetName = path.basename(targetFile)
  log(`Syncing to ${targetName}...`)

  // 构建完整的源数据对象
  const sourceData = readFileContent(sourceFile)

  // 同步内容：保持相同 key 的值，添加新 key，删除不存在的 key
  const targetData = readFileContent(targetFile)
  let isChanged = false

  const flatSourceData = flattenObject(sourceData)
  const flatTargetData = flattenObject(targetData)

  // 增/改
  syncObject(sourceData, targetData, (sourceObj, targetObj, key) => {
    targetObj[key] = getExistVal(sourceObj[key], flatSourceData, flatTargetData)
    console.log(`Add ${key}:`, targetObj[key])

    isChanged = true
  }, true)

  // 删
  syncObject(targetData, sourceData, (sourceObj, targetObj, key) => {
    delete sourceObj[key]
    isChanged = true
  })

  if (isChanged) {
    // 写入同步后的内容
    writeFileContent(targetFile, targetData)
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
