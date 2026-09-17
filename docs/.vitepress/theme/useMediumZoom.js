import mediumZoom from 'medium-zoom'
import { inject, nextTick, onMounted, watch } from 'vue'

export const mediumZoomSymbol = Symbol('mediumZoom')

export const useMediumZoom = () => onMounted(() => inject(mediumZoomSymbol)?.refresh())

export const useMediumZoomProvider = (app, router) => {
  if (import.meta.env.SSR)
    return
  const zoom = mediumZoom('.main img', { background: 'rgba(0,0,0,0.5)' })

  zoom.refresh = () => {
    zoom.detach()
    zoom.attach(':not(a) > img:not(.image-src)')
  }
  
  app.provide(mediumZoomSymbol, zoom)

  watch(
    () => router.route.path,
    () => nextTick(() => zoom.refresh()),
  )
}