const md = require('markdown-it')
const mdAttrs = require('markdown-it-attrs')
const mdDecorate = require('markdown-it-decorate')
const markdownItPdf = require('markdown-it-pdf') // 新增：引入 PDF 插件
const _ = require('lodash')
const underline = require('./underline')
const pdfRender = require('./pdf-render')

const quoteStyles = {
  Chinese: '””‘’',
  English: '“”‘’',
  French: ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'],
  German: '„“‚‘',
  Greek: '«»‘’',
  Japanese: '「」「」',
  Hungarian: '„”’’',
  Polish: '„”‚‘',
  Portuguese: '«»‘’',
  Russian: '«»„“',
  Spanish: '«»‘’',
  Swedish: '””’’'
}

module.exports = {
  async render() {
    const mkdown = md({
      html: this.config.allowHTML,
      breaks: this.config.linebreaks,
      linkify: this.config.linkify,
      typographer: this.config.typographer,
      quotes: _.get(quoteStyles, this.config.quotes, quoteStyles.English),
      highlight(str, lang) {
        if (lang === 'diagram') {
          return `<pre class="diagram">` + Buffer.from(str, 'base64').toString() + `</pre>`
        } else {
          return `<pre><code class="language-${lang}">${_.escape(str)}</code></pre>`
        }
      }
    })
    mkdown.use(pdfRender)
    // // 新增：注册 PDF 预览插件
    // mkdown.use(markdownItPdf)
    if (this.config.underline) {
      mkdown.use(underline)
    }

    mkdown.use(mdAttrs, {
      allowedAttributes: ['id', 'class', 'target']
    })
    mkdown.use(mdDecorate)

    for (let child of this.children) {
      const renderer = require(`../${_.kebabCase(child.key)}/renderer.js`)
      await renderer.init(mkdown, child.config)
    }

    return mkdown.render(this.input)
  }
}
