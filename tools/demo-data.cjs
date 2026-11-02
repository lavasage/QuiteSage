/**
 * 生成占位数据，让仓库在没有微信读书账号的情况下也能构建和预览。
 * 输出：.private/demo-excerpts.json、.private/demo-stats.json
 * 内容全部是明确标注的示例文本，不含任何真实划线。
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, '.private');
fs.mkdirSync(outDir, { recursive: true });

const texts = [
  '这是一段用于预览排版的占位摘抄，长度大约两行，用来观察正文的落点与行距。',
  '第二段占位文字更短，用来检查短句在页面里的位置。',
  '第三段占位文字故意写长一些，用来验证自适应逻辑会在必要时收紧字号与顶部锚点，使整段仍然落在一屏之内，而不需要滚动。',
  '第四段占位文字。',
  '第五段占位文字，用来确认换一则、书名与日期的对齐关系。',
  '第六段占位文字，用于填充摘抄池，避免预览时反复出现同一句。'
];

const titles = ['示例书名·甲', '示例书名·乙', '示例书名·丙'];
const now = new Date();

const excerpts = texts.map((text, i) => {
  const d = new Date(now.getTime() - (i + 1) * 86400000 * 17);
  return {
    id: 'demo-' + (i + 1),
    text,
    title: titles[i % titles.length],
    author: '示例作者',
    chapter: '第一章 占位小节',
    bookId: String(900000 + (i % titles.length)),
    createdAt: Math.floor(d.getTime() / 1000),
    evidence: { fetchedAt: now.toISOString().slice(0, 10) }
  };
});

fs.writeFileSync(
  path.join(outDir, 'demo-excerpts.json'),
  JSON.stringify(
    {
      generatedAt: now.toISOString(),
      selection: '占位数据：仅用于排版预览，不含真实划线。',
      excerpts
    },
    null,
    1
  ),
  'utf8'
);

const months = [0, 0, 0, 42, 0, 118, 0, 0, 63, 0, 205, 0];
const years = [2024, 2025, 2026].map((year) => ({
  year,
  months: months.slice(),
  level: months.map((m) => (m === 0 ? 0 : m < 45 ? 1 : m < 120 ? 2 : 3))
}));

const stats = {
  generatedAt: now.toISOString(),
  snapshotFetchedAt: now.toISOString(),
  readDays: 87,
  totalReadTime: 42 * 3600,
  readStat: [
    { label: '读过', value: '12本' },
    { label: '读完', value: '3本' },
    { label: '阅读', value: '87天' },
    { label: '笔记', value: '26条' }
  ],
  daily: {},
  years,
  hours: [0, 0, 0, 0, 0, 120, 900, 1400, 600, 300, 480, 720, 1100, 640, 380, 260, 420, 900, 2100, 3400, 2600, 1400, 300, 40],
  categories: [
    { title: '示例分类·一', books: 4, hours: 11, share: 0.26 },
    { title: '示例分类·二', books: 3, hours: 9, share: 0.21 },
    { title: '示例分类·三', books: 2, hours: 7, share: 0.17 },
    { title: '示例分类·四', books: 2, hours: 5, share: 0.12 },
    { title: '示例分类·五', books: 1, hours: 3, share: 0.07 }
  ]
};

fs.writeFileSync(path.join(outDir, 'demo-stats.json'), JSON.stringify(stats, null, 1), 'utf8');
console.log('Demo data written to .private/demo-excerpts.json and .private/demo-stats.json');
