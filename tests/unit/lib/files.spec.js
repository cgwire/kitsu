import files from '@/lib/files'

describe('lib/files extension sets', () => {
  it('classifies audio extensions', () => {
    expect(files.AUDIO_EXTENSIONS).toContain('mp3')
    expect(files.AUDIO_EXTENSIONS).toContain('wav')
    expect(files.AUDIO_EXTENSIONS).not.toContain('mp4')
  })

  it('classifies video extensions', () => {
    expect(files.VIDEO_EXTENSIONS).toContain('mp4')
    expect(files.VIDEO_EXTENSIONS).toContain('mov')
    expect(files.VIDEO_EXTENSIONS).toContain('webm')
    expect(files.VIDEO_EXTENSIONS).not.toContain('mp3')
  })
})
