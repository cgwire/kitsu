export default {
  install (Vue) {
    Vue.directive('columns-resizable', {
      componentUpdated (el) {
        if (!el.classList.contains('resizable')) {
          el.className += ' resizable'
        }

        const ths = el.querySelectorAll('th')

        ths.forEach((item) => {
          if (!item.getElementsByClassName('resizable-knob').length > 0) {
            const div = document.createElement('div')
            div.className = 'resizable-knob'
            item.appendChild(div)
            setListeners(div)
          }
        })

        function setListeners (div) {
          var pageX, curCol, curColWidth
          div.addEventListener('mousedown', function (e) {
            curCol = e.target.parentElement
            pageX = e.pageX
            curColWidth = curCol.offsetWidth

            document.addEventListener('mousemove', function (e) {
              if (curCol) {
                var diffX = e.pageX - pageX
                curCol.style.minWidth = (curColWidth + diffX) + 'px'
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
