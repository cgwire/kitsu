import { formatFrame, formatTime } from './video'

export const TIME_CODE_REGEX = /v(\d+)~(\d+):(\d+)\.(\d+) \((\d+)\)/g

export function replaceTimeWithTimecode (
  comment,
  currentPreviewRevision,
  currentTimeRaw,
  fps
) {
  const frame = formatFrame(currentTimeRaw, fps)
  const formatedTime = formatTime(currentTimeRaw)
  return comment.replaceAll(
    '@time', `v${currentPreviewRevision}~${formatedTime} (${frame})`
  )
}
