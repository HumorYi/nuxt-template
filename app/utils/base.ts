/**
 * 休眠函数（异步延迟）
 * @param ms 延迟毫秒数
 * @returns Promise<void> 延迟结束的 Promise
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      clearTimeout(timer)

      resolve()
    }, ms)
  })
}
