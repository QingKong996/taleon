import { parseOutlineResponse } from '@/features/workspace/model/outline/outline-parser';

describe('parseOutlineResponse', () => {
  test('parses JSON chapters, normalizes titles, and sorts by chapter number', () => {
    const result = parseOutlineResponse(
      JSON.stringify([
        {
          chapterNumber: 2,
          title: '第二章：夜航',
          outline: '夜航大纲',
          sections: [{ title: '第二节：离港', outline: '离港细节' }],
        },
        {
          chapterNumber: 1,
          title: '第1章 - 起点',
          outline: '起点大纲',
          sections: [
            { name: '一、清晨', synopsis: '雾中的港口' },
            { title: '', outline: 'missing title' },
          ],
        },
      ]),
      1,
      3,
    );

    expect(result).toEqual({
      chapters: [
        {
          chapterNumber: 1,
          title: '起点',
          outline: '起点大纲',
          sections: [{ title: '一、清晨', outline: '雾中的港口' }],
        },
        {
          chapterNumber: 2,
          title: '夜航',
          outline: '夜航大纲',
          sections: [{ title: '离港', outline: '离港细节' }],
        },
      ],
      expectedChapterNumbers: [1, 2, 3],
      missingChapterNumbers: [3],
    });
  });

  test('repairs fenced JSON with literal newlines and trailing commas', () => {
    const text = [
      '```json',
      '{',
      '  "chapters": [',
      '    {',
      '      "chapterNumber": 3,',
      '      "title": "第三章 雨夜",',
      '      "outline": "第一行',
      '第二行",',
      '      "sections": [',
      '        {"title": "第一节 门", "outline": "铃响",},',
      '      ],',
      '    },',
      '  ],',
      '}',
      '```',
    ].join('\n');

    expect(parseOutlineResponse(text, 3, 1)).toEqual({
      chapters: [
        {
          chapterNumber: 3,
          title: '雨夜',
          outline: '第一行\n第二行',
          sections: [{ title: '门', outline: '铃响' }],
        },
      ],
      expectedChapterNumbers: [3],
      missingChapterNumbers: [],
    });
  });

  test('finds chapters in nested payloads and parses Chinese numbers', () => {
    const result = parseOutlineResponse(
      JSON.stringify({
        data: {
          chapters: [
            {
              chapter: '十一',
              title: '第十一章 重逢',
              outline: '重逢大纲',
              sectionList: [{ title: '第一节 见', outline: '见面细节' }],
            },
            {
              chapter: '十二',
              title: '第十二章 终局',
              outline: '终局大纲',
            },
          ],
        },
      }),
      11,
      3,
    );

    expect(result.chapters).toEqual([
      {
        chapterNumber: 11,
        title: '重逢',
        outline: '重逢大纲',
        sections: [{ title: '见', outline: '见面细节' }],
      },
      {
        chapterNumber: 12,
        title: '终局',
        outline: '终局大纲',
        sections: [],
      },
    ]);
    expect(result.missingChapterNumbers).toEqual([13]);
  });

  test.each([
    ['第一章 起点', 1],
    ['第10章 转折', 10],
    ['第一百零二章 尾声', 102],
  ])('parses chapter number from %s', (title, chapterNumber) => {
    const result = parseOutlineResponse(
      JSON.stringify([{ title, outline: '大纲' }]),
      chapterNumber,
      1,
    );

    expect(result.chapters).toEqual([
      {
        chapterNumber,
        title: title.replace(/^第.+?章\s*/, ''),
        outline: '大纲',
        sections: [],
      },
    ]);
    expect(result.missingChapterNumbers).toEqual([]);
  });

  test('scans separate chapter objects from surrounding prose', () => {
    const text = [
      '模型输出如下：',
      '{"title":"第一章 雾","outline":"雾的大纲"}',
      '补充说明',
      '{"title":"第二章 灯","outline":"灯的大纲","sections":[]}',
    ].join('\n');

    expect(parseOutlineResponse(text, 1, 2)).toEqual({
      chapters: [
        {
          chapterNumber: 1,
          title: '雾',
          outline: '雾的大纲',
          sections: [],
        },
        {
          chapterNumber: 2,
          title: '灯',
          outline: '灯的大纲',
          sections: [],
        },
      ],
      expectedChapterNumbers: [1, 2],
      missingChapterNumbers: [],
    });
  });

  test('reassigns out-of-range and duplicate chapter numbers', () => {
    const result = parseOutlineResponse(
      JSON.stringify([
        { chapterNumber: 9, title: '外传', outline: 'A' },
        { chapterNumber: 1, title: '重复编号', outline: 'B' },
        { title: '第一章 标题', outline: 'C' },
      ]),
      1,
      3,
    );

    expect(result.chapters).toEqual([
      { chapterNumber: 1, title: '外传', outline: 'A', sections: [] },
      { chapterNumber: 2, title: '重复编号', outline: 'B', sections: [] },
      { chapterNumber: 3, title: '标题', outline: 'C', sections: [] },
    ]);
    expect(result.missingChapterNumbers).toEqual([]);
  });

  test('skips invalid chapters and reports missing numbers', () => {
    const result = parseOutlineResponse(
      JSON.stringify([
        { title: '第一章 有效', outline: 'A' },
        { title: '第二章 缺大纲' },
        { title: '', outline: 'missing title' },
        {
          title: '第三章 有效',
          outline: 'B',
          sections: [{ title: '', outline: 'invalid section' }],
        },
      ]),
      1,
      3,
    );

    expect(result.chapters).toEqual([
      { chapterNumber: 1, title: '有效', outline: 'A', sections: [] },
      { chapterNumber: 3, title: '有效', outline: 'B', sections: [] },
    ]);
    expect(result.missingChapterNumbers).toEqual([2]);
  });

  test('supports alternate chapter and section field names', () => {
    const result = parseOutlineResponse(
      JSON.stringify([
        {
          number: '1',
          title: '第一章 远行',
          chapterOutline: '别名大纲',
          beats: [{ title: '第一节 出发', summary: '别名分节' }],
        },
      ]),
      1,
      1,
    );

    expect(result.chapters).toEqual([
      {
        chapterNumber: 1,
        title: '远行',
        outline: '别名大纲',
        sections: [{ title: '出发', outline: '别名分节' }],
      },
    ]);
  });

  test.each([0, -2])(
    'returns no chapters when expectedCount is %i',
    (expectedCount) => {
      expect(
        parseOutlineResponse(
          JSON.stringify([{ title: '第一章 起点', outline: '大纲' }]),
          5,
          expectedCount,
        ),
      ).toEqual({
        chapters: [],
        expectedChapterNumbers: [],
        missingChapterNumbers: [],
      });
    },
  );

  test('returns all expected numbers as missing when no payload can be parsed', () => {
    expect(parseOutlineResponse('not json at all', 4, 2)).toEqual({
      chapters: [],
      expectedChapterNumbers: [4, 5],
      missingChapterNumbers: [4, 5],
    });
  });
});
