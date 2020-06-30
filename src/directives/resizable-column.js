export default {
  install (Vue) {
    Vue.directive('columns-resizable', {
      componentUpdated (el) {
        if (!el.id) {
          console.error('Resizable headers must be in a thead with an id')
          return
        }

        if (!el.classList.contains('resizable')) {
          el.className += ' resizable'
        }

        const nameThs = Array.from(el.getElementsByClassName('name'))
        const metaThs =
          Array.from(el.getElementsByClassName('metadata-descriptor'))
        const ths = nameThs.concat(metaThs)

        const setListeners = (item, div) => {
          let pageX, curCol, curColWidth
          div.addEventListener('mousedown', function (e) {
            curCol = e.target.parentElement
            pageX = e.pageX
            curColWidth = curCol.offsetWidth

            document.addEventListener('mousemove', function (e) {
              if (curCol) {
                const diffX = e.pageX - pageX
                const newWidth = (curColWidth + diffX) + 'px'
                curCol.style.minWidth = newWidth
                curCol.style.width = newWidth
                localStorage.setItem(`${el.id}-${item.textContent}`, newWidth)
              }
            })
          })

          document.addEventListener('mouseup', function (e) {
            curCol = undefined
            pageX = undefined
            curColWidth = undefined
            document.onmousemove = null
          })
        }

        ths.forEach((item) => {
          if (!item.getElementsByClassName('resizable-knob').length > 0) {
            const div = document.createElement('div')
            div.className = 'resizable-knob'
            item.appendChild(div)
            setListeners(item, div)
          }
          const width = localStorage.getItem(`${el.id}-${item.textContent}`)
          if (width) {
            item.style.minWidth = width
            item.style.width = width
          }
        })
      }
    })
  }
}
