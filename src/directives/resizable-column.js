import preferences from '@/lib/preferences'

export default {
  install(app) {
    app.directive('columns-resizable', {
      updated(el) {
        if (!el.id) {
          console.error('Resizable headers must be in a thead with an id')
          return
        }

        if (!el.classList.contains('resizable')) {
          el.className += ' resizable'
        }

        // updated() re-runs on every re-render of the header: read each
        // stored width once and keep it on the element.
        el._columnWidths = el._columnWidths || new Map()
        const storageKey = item => `${el.id}-${item.textContent}`
        const getStoredWidth = item => {
          const key = storageKey(item)
          if (!el._columnWidths.has(key)) {
            el._columnWidths.set(key, preferences.getPreference(key))
          }
          return el._columnWidths.get(key)
        }

        const nameThs = Array.from(el.getElementsByClassName('name'))
        const metaThs = Array.from(
          el.getElementsByClassName('metadata-descriptor')
        )
        const descriptionThs = Array.from(
          el.getElementsByClassName('description')
        )
        const ths = nameThs.concat(metaThs, descriptionThs)

        const setListeners = (item, div) => {
          let pageX, curCol, curColWidth, newWidth

          const onMouseMove = e => {
            if (curCol) {
              const diffX = e.pageX - pageX
              newWidth = curColWidth + diffX + 'px'
              curCol.style.minWidth = newWidth
              curCol.style.width = newWidth
              // The header can re-render mid-drag (AssetList observes the
              // name column) and updated() re-applies the cached width:
              // keep the cache on the live value.
              el._columnWidths.set(storageKey(item), newWidth)
            }
          }

          const onMouseDown = e => {
            curCol = e.target.parentElement
            pageX = e.pageX
            curColWidth = curCol.offsetWidth
            newWidth = undefined
            document.addEventListener('mousemove', onMouseMove)
          }

          const onMouseUp = () => {
            const widthToPersist = curCol && newWidth
            curCol = undefined
            pageX = undefined
            curColWidth = undefined
            document.removeEventListener('mousemove', onMouseMove)
            // localStorage writes are synchronous: persist once per resize,
            // not once per mousemove, and after the reset so a storage
            // error cannot leave the drag armed.
            if (widthToPersist) {
              preferences.setPreference(storageKey(item), widthToPersist)
            }
          }

          div.addEventListener('mousedown', onMouseDown)
          document.addEventListener('mouseup', onMouseUp)

          // The directive re-runs for each new thead, so track the
          // document-level listeners and let the unmounted hook detach them.
          el._columnResizeCleanups = el._columnResizeCleanups || []
          el._columnResizeCleanups.push(() => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
          })
        }

        ths.forEach(item => {
          if (!item.getElementsByClassName('resizable-knob').length > 0) {
            const div = document.createElement('div')
            div.className = 'resizable-knob'
            item.appendChild(div)
            setListeners(item, div)
          }
          const width = getStoredWidth(item)
          if (width) {
            item.style.minWidth = width
            item.style.width = width
          }
        })
      },
      unmounted(el) {
        if (el._columnResizeCleanups) {
          el._columnResizeCleanups.forEach(cleanup => cleanup())
          el._columnResizeCleanups = null
        }
        el._columnWidths = null
      }
    })
  }
}
