/*
 * Single source of the "preview extension → media kind" dispatch, shared by
 * PreviewViewer and the playlist players so a new preview type is wired in
 * one place. `enabled` gates every kind (PreviewViewer holds everything off
 * while a preview is processing or broken); `isFile` is the catch-all for
 * previews no viewer handles.
 */
import { computed, unref } from 'vue'

import {
  isDiffPreview,
  isMarkdownPreview,
  isModelPreview,
  isMoviePreview,
  isPdfPreview,
  isPicturePreview,
  isSoundPreview,
  isTransparentPicturePreview
} from '@/lib/preview'

export const useMediaKind = (extension, enabled = null) => {
  const isOn = () => (enabled ? unref(enabled) : true)
  const isDiff = computed(() => isOn() && isDiffPreview(unref(extension)))
  const isMarkdown = computed(
    () => isOn() && isMarkdownPreview(unref(extension))
  )
  const isModel = computed(() => isOn() && isModelPreview(unref(extension)))
  const isMovie = computed(() => isOn() && isMoviePreview(unref(extension)))
  const isPdf = computed(() => isOn() && isPdfPreview(unref(extension)))
  const isPicture = computed(() => isOn() && isPicturePreview(unref(extension)))
  const isSound = computed(() => isOn() && isSoundPreview(unref(extension)))
  const isTransparentPicture = computed(
    () => isOn() && isTransparentPicturePreview(unref(extension))
  )
  const isFile = computed(
    () =>
      isOn() &&
      !isDiff.value &&
      !isMarkdown.value &&
      !isModel.value &&
      !isMovie.value &&
      !isPdf.value &&
      !isPicture.value &&
      !isSound.value
  )

  return {
    isDiff,
    isFile,
    isMarkdown,
    isModel,
    isMovie,
    isPdf,
    isPicture,
    isSound,
    isTransparentPicture
  }
}
