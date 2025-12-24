export default {
  // 扩展页面渲染组件
  mixins: [
    {
      mounted() {
        // 确保 PDF iframe 正确加载
        const iframes = this.$el.querySelectorAll('iframe[src$=".pdf"]')
        iframes.forEach(iframe => {
          iframe.onload = function () {
            // 处理跨域或加载失败的情况
            try {
              iframe.contentWindow.document.title
            } catch (e) {
              console.warn('PDF 跨域受限:', iframe.src)
            }
          }
        })
      }
    }
  ]
}
