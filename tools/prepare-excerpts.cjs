// Run locally after normalization. Only the selected display data is bundled;
// API credentials and the full reading snapshot never enter the app assets.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, '.private/normalized.json'), 'utf8'));
const books = new Map(data.books.map(book => [book.id, book]));
const seen = new Set();
const excerpts = data.notes.filter(note => {
  const book = books.get(note.bookId);
  if (note.kind !== 'highlight' || !book || !book.title || !book.author) return false;
  const length = Array.from(note.text || '').length;
  if (length < 28 || length > 110 || seen.has(note.text)) return false;
  seen.add(note.text);
  return true;
}).map(note => {
  const book = books.get(note.bookId);
  return {
    id: note.id, text: note.text, bookId: note.bookId,
    title: book.title, author: book.author, chapter: note.chapter || null,
    createdAt: note.createdAt || null, evidence: note.evidence,
    metadataEvidence: book.evidence.metadata
  };
});
const result = {
  generatedAt: new Date().toISOString(), snapshotGeneratedAt: data.generatedAt,
  selection: '完整划线；28–110个字符；书名和作者可用；相同文字去重；未按观点筛选。',
  excerpts
};
fs.writeFileSync(path.join(root, '.private/excerpts.json'), JSON.stringify(result));
console.log('Prepared ' + excerpts.length + ' authentic excerpts from ' + new Set(excerpts.map(x => x.bookId)).size + ' books.');
