export default defineWrappedResponseHandler(() => {
  // 模拟 ISR 内容数据
  return {
    updatedAt: new Date().toLocaleString(),
  }
})
