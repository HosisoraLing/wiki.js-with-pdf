module.exports = {
  activated() {
    // 当模块激活时，注册 Markdown 扩展
    this.$app.on('markdownBeforeInit', ({ markdown }) => {
      const markdownItPdf = require('markdown-it-pdf')
      markdown.use(markdownItPdf)
    })
  }
}
