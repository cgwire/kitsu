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

        const ths = el.querySelectorAll('th')

        ths.forEach((item) => {
          if (!item.getElementsByClassName('resizable-knob').length > 0) {
            const div = document.createElement('div')
            div.className = 'resizable-knob'
            item.appendChild(div)
            setListeners(item, div)
          }
          if (localStorage.getItem(`${el.id}-${item.textContent}`)) {
            item.style.minWidth =
              localStorage.getItem(`${el.id}-${item.textContent}`)
          }
        })

        function setListeners (item, div) {
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
      }
    })
  }
}
