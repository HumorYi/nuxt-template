export default defineWrappedResponseHandler(() => {
  // 模拟 SSG 内容数据
  return {
    generatedAt: new Date().toLocaleString(),
  }
})
