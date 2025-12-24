module.exports = function (md, options) {
  // 覆盖默认的链接渲染规则
  const defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const hrefIndex = tokens[idx].attrIndex('href')
    if (hrefIndex >= 0) {
      const href = tokens[idx].attrs[hrefIndex][1]

      // 判断是否为 PDF 文件链接
      if (href.toLowerCase().endsWith('.pdf')) {
        // 获取链接的文本（标题）
        let title = ''
        for (let i = idx + 1; i < tokens.length; i++) {
          if (tokens[i].type === 'link_close') break
          if (tokens[i].type === 'text') title = tokens[idx].content
        }

        // 构建指向 PDF.js 查看器的 URL
        // 假设你的 pdfjs 文件夹放在网站根目录，访问路径为 `/assets/pdfjs/`
        const viewerUrl = `/pdfjs/web/viewer.html?file=${href}`

        // 返回 iframe 代码，完全替换原链接
        // 设置高度并隐藏边框以获得更好体验
        return `<div class="iframe-container">
                  <iframe
                    src="${viewerUrl}"
                    title="PDF预览: ${title}"
                    width="100%"
                    style="aspect-ratio: 210 / 297; height: auto;"
                    frameborder="0"
                    class="wiki-pdf-frame">
                  </iframe>
                </div>`
      }
    }
    // 非 PDF 链接，使用默认渲染方式
    return defaultRender(tokens, idx, options, env, self)
  }
}
