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

  // 动态计算padding-bottom
  function calculatePaddingBottom(ratio) {
    const parts = ratio.split('/')
    if (parts.length !== 2) return '56.25%'

    const width = parseFloat(parts[0])
    const height = parseFloat(parts[1])

    if (!width || !height) return '56.25%'

    // padding-bottom = height / width * 100%
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
      let href = token.attrs[hrefIndex][1]
      const cleanHref = href.split('#')[0]

      if (cleanHref.toLowerCase().endsWith('.pdf')) {
        let ratio = defaultRatio

        const hashIndex = href.indexOf('#')
        if (hashIndex >= 0) {
          const hash = href.substring(hashIndex + 1)
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
    }

    return defaultRender(tokens, idx, options, env, self)
  }
}
