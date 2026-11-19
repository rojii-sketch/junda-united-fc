// The API stores date and kickoff as display strings. Preserve the club's
// day-first date format and explicit East Africa Time without UTC conversion.
export function fixtureSchedule(date, time) {
  const [year, month, day] = date.split('-');
  return {
    matchDate: `${day}/${month}/${year}`,
    kickoffTime: time ? `${time} EAT` : ''
  };
}

export function parseMatchDate(value) {
  if (typeof value !== 'string' || !value.trim()) return null;

  const trimmedValue = value.trim();
  const dayMonthYear = trimmedValue.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dayMonthYear) {
    const [, day, month, year] = dayMonthYear;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.getFullYear() === Number(year)
      && date.getMonth() === Number(month) - 1
      && date.getDate() === Number(day)
      ? date
      : null;
  }

  const parsedTime = Date.parse(trimmedValue);
  return Number.isNaN(parsedTime) ? null : new Date(parsedTime);
}
