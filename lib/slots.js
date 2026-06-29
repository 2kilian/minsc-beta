export function generateDays(datumVon, datumBis) {
  const days = [];
  const start = new Date(datumVon + 'T12:00:00');
  const end = new Date(datumBis + 'T12:00:00');
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

const WT_KURZ = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const WT_LANG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MO = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

export function formatDatum(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return `${WT_KURZ[d.getDay()]}, ${d.getDate()}. ${MO[d.getMonth()]}`;
}

export function formatDatumKurz(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return { wt: WT_KURZ[d.getDay()], datum: `${d.getDate()}. ${MO[d.getMonth()]}` };
}

export function formatDatumLang(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return `${WT_LANG[d.getDay()]}, ${d.getDate()}. ${MO[d.getMonth()]} ${d.getFullYear()}`;
}

export function besteZeiten(meeting) {
  const { antworten } = meeting;
  const result = {};
  for (const [person, slots] of Object.entries(antworten)) {
    for (const slot of slots) {
      if (!result[slot]) result[slot] = new Set();
      result[slot].add(person);
    }
  }
  return Object.entries(result)
    .map(([slot, persons]) => ({ slot, persons: [...persons], count: persons.size }))
    .sort((a, b) => b.count - a.count || a.slot.localeCompare(b.slot));
}
