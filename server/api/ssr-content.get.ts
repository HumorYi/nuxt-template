export default defineWrappedResponseHandler(() => {
  // 模拟 SSR 内容数据
  return {
    renderedAt: new Date().toLocaleString(),
  }
})
