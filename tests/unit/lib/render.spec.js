// @vitest-environment node

import {
  renderComment,
  renderFileSize,
  renderMarkdown,
  replaceTimeWithTimecode,
  safeUrl
} from '@/lib/render'

describe('render', () => {
  describe('safeUrl', () => {
    test('keeps http(s) and relative URLs', () => {
      expect(safeUrl('https://cg-wire.com')).toBe('https://cg-wire.com')
      expect(safeUrl('http://intranet/page')).toBe('http://intranet/page')
      expect(safeUrl('/productions/prod-1')).toBe('/productions/prod-1')
    })

    test('drops unsafe schemes and empty values (SEC-7)', () => {
      expect(safeUrl('javascript:alert(1)')).toBe(null)
      expect(safeUrl(' javascript:alert(1)')).toBe(null)
      expect(safeUrl('data:text/html,<script>x</script>')).toBe(null)
      expect(safeUrl('vbscript:msgbox')).toBe(null)
      expect(safeUrl('')).toBe(null)
      expect(safeUrl(undefined)).toBe(null)
    })

    test('reads the scheme the way the browser does', () => {
      expect(safeUrl('java\tscript:alert(1)')).toBe(null)
      expect(safeUrl('java\nscript:alert(1)')).toBe(null)
      expect(safeUrl('java\rscript:alert(1)')).toBe(null)
      expect(safeUrl('\u0001javascript:alert(1)')).toBe(null)
      expect(safeUrl('ht\ttps://cg-wire.com')).toBe('ht\ttps://cg-wire.com')
    })
  })

  test('renderComment', () => {
    const input = 'Text @Jhon Doe'
    const mentions = ['person-1']
    const personMap = new Map(Object.entries(
      { 'person-1': { id: 'person-1', full_name: 'Jhon Doe' } }
    ))
    const result = renderComment(input, mentions, [], personMap, {})
    expect(result.trim()).toEqual(
      '<p>Text <a class="mention" href="/people/person-1">@Jhon Doe</a></p>'
    )
  })

  test('renderComment with departments', () => {
    const input = 'Text @Modeling'
    const mentions = ['department-1']
    const departmentMap = new Map(Object.entries(
      {
        'department-1': {
          id: 'department-1', name: 'Modeling', color: 'red'
        }
      }
    ))
    const result = renderComment(input, [], mentions, {}, departmentMap)
    expect(result.trim()).toEqual(
      '<p>Text <span style="color: red">@Modeling</span></p>'
    )
  })

  test('renderComment links the task types with a safe URL, and #All', () => {
    const taskTypes = [
      { name: 'Light & Render', url: '/productions/p1/tasks/tt1?a=1&b=2' },
      { name: 'Anim', url: 'javascript:alert(1)' }
    ]
    const result = renderComment(
      '#Light & Render #Anim #All',
      [],
      [],
      new Map(),
      new Map(),
      taskTypes
    )
    expect(result.trim()).toEqual(
      '<p><a class="mention mention-task" ' +
        'href="/productions/p1/tasks/tt1?a=1&amp;b=2">#Light &amp; Render</a> ' +
        '#Anim <a class="mention mention-task" href="#">#All</a></p>'
    )
  })

  // Sanitized text keeps quotes and apostrophes raw: names holding them,
  // like O'Brien, must still be found.
  test('renderComment finds the mentions of a name holding quotes', () => {
    const personMap = new Map([
      ['person-1', { id: 'person-1', full_name: 'Sean "Tom & Jerry" O\'Brien' }]
    ])
    const departmentMap = new Map([
      ['department-1', { id: 'department-1', name: "Director's", color: 'red' }]
    ])
    const taskTypes = [{ name: "Artist's cut", url: '/tasks/tt1' }]
    const result = renderComment(
      'Hi @Sean "Tom & Jerry" O\'Brien, @Director\'s, #Artist\'s cut',
      ['person-1'],
      ['department-1'],
      personMap,
      departmentMap,
      taskTypes
    )
    expect(result.trim()).toEqual(
      '<p>Hi <a class="mention" href="/people/person-1">' +
        '@Sean "Tom &amp; Jerry" O\'Brien</a>, ' +
        '<span style="color: red">@Director\'s</span>, ' +
        '<a class="mention mention-task" href="/tasks/tt1">#Artist\'s cut</a></p>'
    )
  })

  test('renderComment marks the timecodes of a revision', () => {
    const result = renderComment(
      'Fix v3 00:01:02.04 (28) please',
      [],
      [],
      new Map(),
      new Map(),
      [],
      'clickable'
    )
    const timecode = result.match(/<span([^>]*)>([^<]*)<\/span>/)
    expect(timecode[2]).toBe('v3 00:01:02.04 (28)')
    expect(timecode[1].replace(/\s+/g, ' ').trim()).toBe(
      'class="timecode clickable" data-version-revision="3" data-frame="28"'
    )
  })

  test('renderMarkdown - offensive script', () => {
    const input = 'Text **bold**<script>console.log(\'test\')</script>'
    const result = renderMarkdown(input)
    expect(result.trim()).toEqual('<p>Text <strong>bold</strong></p>')
  })

  test('renderMarkdown - offensive img', () => {
    let input =
      'Text **bold** <img onerror="console.log(\'test\')" src="picture.png" />'
    let result = renderMarkdown(input)
    expect(result.trim()).toEqual(
      '<p>Text <strong>bold</strong> <img src="picture.png" /></p>')
    input = 'Text **bold** <img src="picture.png" />'
    result = renderMarkdown(input)
    expect(result.trim()).toEqual(
      '<p>Text <strong>bold</strong> <img src="picture.png" /></p>')
  })

  test('renderMarkdown - strikethrough', () => {
    const result = renderMarkdown('this is ~~cut~~ kept')
    expect(result.trim()).toEqual('<p>this is <del>cut</del> kept</p>')
  })

  test('renderMarkdown - image keeps alt and title', () => {
    const result = renderMarkdown('![shot](shot.png "Shot 10")')
    expect(result.trim()).toEqual(
      '<p><img src="shot.png" alt="shot" title="Shot 10" /></p>'
    )
  })

  test('renderMarkdown - table column alignment', () => {
    const result = renderMarkdown('| a |\n|:--:|\n| 1 |')
    expect(result).toContain('<th align="center">a</th>')
    expect(result).toContain('<td align="center">1</td>')
  })

  test('renderMarkdown - task-list checkboxes stripped by default', () => {
    const result = renderMarkdown('- [ ] todo\n- [x] done')
    expect(result).not.toContain('<input')
  })

  test('renderMarkdown - task-list checkboxes kept with allowChecklist', () => {
    const result = renderMarkdown('- [ ] todo\n- [x] done', {
      allowChecklist: true
    })
    expect(result).toContain('<input disabled type="checkbox" /> todo')
    expect(result).toContain('<input checked disabled type="checkbox" /> done')
  })

  test('renderMarkdown - checkbox input cannot smuggle other attributes', () => {
    const result = renderMarkdown(
      '<input type="text" onfocus="alert(1)" value="x">',
      { allowChecklist: true }
    )
    expect(result).not.toContain('onfocus')
    expect(result).not.toContain('value')
  })

  test('renderMarkdown - emoji shortcodes', () => {
    expect(renderMarkdown('Good :smile: and :+1:').trim()).toEqual(
      '<p>Good 😄 and 👍</p>'
    )
    expect(renderMarkdown(':SMILE: :heart_eyes: :100: :-1:').trim()).toEqual(
      '<p>😄 😍 💯 👎</p>'
    )
    expect(renderMarkdown(':smile::wink: x:smile:y').trim()).toEqual(
      '<p>😄😉 x😄y</p>'
    )
  })

  test('renderMarkdown - emoji shortcodes in formatting, links and blocks', () => {
    expect(
      renderMarkdown('**:smile:** _:wink:_ [:tada:](https://a.test)').trim()
    ).toEqual(
      '<p><strong>😄</strong> <em>😉</em> <a href="https://a.test">🎉</a></p>'
    )
    expect(renderMarkdown('- item :tada:\n> quote :smile:').trim()).toEqual(
      '<ul>\n<li>item 🎉</li>\n</ul>\n' +
        '<blockquote>\n<p>quote 😄</p>\n</blockquote>'
    )
  })

  test('renderMarkdown - no emoji in code, URLs, escapes or unknown names', () => {
    expect(renderMarkdown('Code `:smile:` here').trim()).toEqual(
      '<p>Code <code>:smile:</code> here</p>'
    )
    expect(renderMarkdown('```\n:smile:\n```').trim()).toEqual(
      '<pre><code>:smile:\n</code></pre>'
    )
    expect(renderMarkdown('See https://a.test/:smile:/x').trim()).toEqual(
      '<p>See <a href="https://a.test/:smile:/x">https://a.test/:smile:/x</a></p>'
    )
    expect(renderMarkdown('\\:smile\\:').trim()).toEqual('<p>:smile:</p>')
    expect(renderMarkdown(':unknown: at 10:30:00').trim()).toEqual(
      '<p>:unknown: at 10:30:00</p>'
    )
  })

  test('renderFileSize', () => {
    let size = 1200000
    let result = renderFileSize(size)
    expect(result.trim()).toEqual('1.2M')
    size = 1200000000
    result = renderFileSize(size)
    expect(result.trim()).toEqual('1.2G')
  })

  // SMPTE: frame 31 is the first frame of the second second at 30 fps.
  test.each([
    [1, 30, 'v2 00:00:00:00 (1)'],
    [31, 30, 'v2 00:00:01:00 (31)'],
    [1201, 30, 'v2 00:00:40:00 (1201)'],
    [1441, 24, 'v2 00:01:00:00 (1441)'],
    [26, 25, 'v2 00:00:01:00 (26)']
  ])(
    'replaceTimeWithTimecode labels frame %i at %i fps',
    (frame, fps, text) => {
      expect(replaceTimeWithTimecode('@frame', 2, frame, fps)).toBe(text)
    }
  )
})
