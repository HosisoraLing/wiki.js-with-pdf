module.exports = function (md, options = {}) {
  const {
    pdfjsPath = '/pdfjs/web/viewer.html',
    defaultRatio = '16/9'
  } = options

  const ratioPresets = {
    'p': '16/9',
    'h': '297/210',
    'v': '210/297',
    'ppt': '16/9',
    '横向a4': '297/210',
    'a4横向': '297/210',
    '纵向a4': '210/297',
    'a4纵向': '210/297'
  }

  function parseRatio(input) {
    if (!input) return defaultRatio
    const key = input.toLowerCase().trim()

    if (ratioPresets[key]) {
      return ratioPresets[key]
    }

    // 支持 4/3 或 4:3 或 9:16 等任意格式
    if (input.match(/^\d+\/\d+$/) || input.match(/^\d+:\d+$/)) {
      return input.replace(':', '/')
    }

    return defaultRatio
  }

  function calculatePaddingBottom(ratio) {
    const parts = ratio.split('/')
    if (parts.length !== 2) return '56.25%'

    const width = parseFloat(parts[0])
    const height = parseFloat(parts[1])

    if (!width || !height) return '56.25%'

    const percentage = (height / width * 100).toFixed(2)
    return percentage + '%'
  }

  const defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const token = tokens[idx]
    const hrefIndex = token.attrIndex('href')

    if (hrefIndex >= 0) {
      const originalHref = token.attrs[hrefIndex][1]

      // 关键：先检查是否是PDF，避免影响其他文件
      const cleanHref = originalHref.split('#')[0]

      // 严格PDF检测：只处理以.pdf结尾的链接
      if (!cleanHref.toLowerCase().endsWith('.pdf')) {
        // 非PDF文件，返回原始渲染，不做任何处理
        return defaultRender(tokens, idx, options, env, self)
      }

      // 只有PDF文件才会继续执行
      let ratio = defaultRatio

      // 从原始URL解析hash（不截断，避免影响视频等）
      const hashIndex = originalHref.indexOf('#')
      if (hashIndex >= 0) {
        const hash = originalHref.substring(hashIndex + 1)
        if (hash) {
          ratio = parseRatio(hash)
        }
      }

      const viewerUrl = `${pdfjsPath}?file=${cleanHref}`
      const paddingBottom = calculatePaddingBottom(ratio)

      return `
<div style="margin:1rem 0;background:#f5f5f5;border-radius:8px;overflow:hidden;width:100%;max-width:100%;box-sizing:border-box;border:1px solid #e0e0e0;">
  <div style="position:relative;width:100%;background:white;padding-bottom:${paddingBottom};">
    <iframe src="${viewerUrl}" title="PDF预览" width="100%" height="100%" frameborder="0" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;margin:0;display:block;min-height:400px;"></iframe>
  </div>
</div>
      `
    }

    return defaultRender(tokens, idx, options, env, self)
  }
}
