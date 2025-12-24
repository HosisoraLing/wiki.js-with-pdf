// 等待页面加载完成后执行
setTimeout(() => {
  const iframes = document.querySelectorAll('.embed-pdf iframe')
  if (iframes.length === 0) {
    console.warn('未找到 PDF iframe，可能渲染顺序问题')
    return
  }

  iframes.forEach(iframe => {
    // 重新设置 src 触发加载
    const src = iframe.src
    iframe.src = ''
    iframe.src = src

    // 添加可见性检查
    iframe.onload = () => {
      console.log('✅ PDF 加载成功:', src)
      iframe.style.border = '3px solid green'
    }
    iframe.onerror = () => {
      console.error('❌ PDF 加载失败:', src)
      iframe.style.border = '3px solid red'
    }
  })
}, 1000)
