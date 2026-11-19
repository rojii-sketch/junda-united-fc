const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Nairobi'
});

const monthNames = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

function normalizeDateLabel(label) {
  const dayFirst = label.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dayFirst) {
    const [, day, month, year] = dayFirst;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  if (/^\d{4}\.\d{2}\.\d{2}$/.test(label)) return label.replaceAll('.', '-');

  const namedDate = label.match(/^(?<day>\d{1,2})\s+(?<name>[a-z]+)\.?\s+(?<year>\d{4})$/i)
    ?? label.match(/^(?<name>[a-z]+)\.?\s+(?<day>\d{1,2})(?:,\s*|\s+)(?<year>\d{4})$/i);
  if (namedDate) {
    const { day, name, year } = namedDate.groups;
    const nameKey = name.toLowerCase();
    const month = monthNames.findIndex(candidate => candidate === nameKey || candidate.slice(0, 3) === nameKey) + 1;
    return `${year}-${String(month).padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return label;
}

export function classifyPublicationDate(value) {
  const label = typeof value === 'string' ? value.trim() : '';
  if (!label) return { kind: 'EMPTY' };

  const iso = normalizeDateLabel(label);
  const datePart = iso.match(/^\d{4}-\d{2}-\d{2}(?=$|T)/)?.[0];
  if (!datePart) {
    const looksLikeDate = /^\d{1,4}[./-]\d{1,2}[./-]\d{1,4}(?=$|[T\s])/i.test(label);
    return looksLikeDate ? { kind: 'INVALID_DATE' } : { kind: 'LEGACY_TEXT', label };
  }

  const [year, month, day] = datePart.split('-').map(Number);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysPerMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysPerMonth[month - 1]) return { kind: 'INVALID_DATE' };

  if (iso !== datePart && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:?\d{2})$/i.test(iso)) {
    return { kind: 'INVALID_DATE' };
  }
  const timestamp = Date.parse(iso);
  if (!Number.isFinite(timestamp)) return { kind: 'INVALID_DATE' };

  return {
    kind: 'VALID_DATE',
    timestamp,
    dateTime: iso === datePart ? datePart : new Date(timestamp).toISOString(),
    label: dateFormat.format(timestamp)
  };
}

export function publicationDate(value) {
  const { kind, ...date } = classifyPublicationDate(value);
  return kind === 'VALID_DATE' || kind === 'LEGACY_TEXT' ? date : { label: '' };
}

function isArticleId(id) {
  return typeof id === 'string' && /^[a-z0-9_-]+$/i.test(id);
}

export function normalizeNewsCollection(response) {
  if (!Array.isArray(response)) throw new TypeError('Expected an array of news records');

  const articles = [];
  const seen = new Set();
  for (const record of response) {
    if (!record || typeof record !== 'object' || Array.isArray(record)) continue;
    const { _id, title, content, imageUrl, date } = record;
    if (!isArticleId(_id) || typeof title !== 'string' || !title.trim() || seen.has(_id)) continue;

    seen.add(_id);
    articles.push({
      _id,
      title,
      content: typeof content === 'string' ? content : undefined,
      imageUrl: typeof imageUrl === 'string' ? imageUrl : undefined,
      date: typeof date === 'string' ? date : undefined
    });
  }
  return articles;
}

export function orderNews(articles) {
  return articles.map(article => ({ article, date: publicationDate(article.date).timestamp ?? -Infinity }))
    .sort((first, second) => {
      if (first.date === second.date) return 0;
      return first.date > second.date ? -1 : 1;
    })
    .map(({ article }) => article);
}

export function relatedNews(articles, currentId) {
  const seen = new Set([currentId]);
  const related = [];
  for (const article of articles) {
    const id = article?._id;
    if (!isArticleId(id) || seen.has(id)) continue;
    seen.add(id);
    related.push(article);
    if (related.length === 3) break;
  }
  return related;
}

export function newsExcerpt(content, limit) {
  const text = typeof content === 'string' ? content.replace(/\s+/g, ' ').trim() : '';
  const characters = Array.from(text);
  if (characters.length <= limit) return text;
  const cut = characters.slice(0, limit - 1).join('');
  const boundary = cut.lastIndexOf(' ');
  return (boundary > 0 ? cut.slice(0, boundary) : cut) + '…';
}

export function newsParagraphs(content) {
  return typeof content === 'string'
    ? content.replace(/\r\n?/g, '\n').trim().split(/\n[^\S\n]*\n+/).map(part => part.trim()).filter(Boolean)
    : [];
}

export function articlePath(id) {
  return `/news/${encodeURIComponent(id)}`;
}

export function newsImageUrl(value, origin) {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  try {
    const url = new URL(value.trim(), origin);
    if (['http:', 'https:'].includes(url.protocol) && !url.username && !url.password) return url.href;
  } catch {
    return undefined;
  }
  return undefined;
}
