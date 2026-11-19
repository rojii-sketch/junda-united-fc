import { publicationDate } from '../../utils/newsEditorial';

export default function NewsDate({ value }) {
  const { label, dateTime } = publicationDate(value);
  if (!label) return null;
  return dateTime
    ? <time className="editorial-date" dateTime={dateTime}>{label}</time>
    : <span className="editorial-date">{label}</span>;
}
