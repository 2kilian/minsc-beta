const STEP = 60; // 1-Stunden-Slots

export function generateSlots(datumVon, datumBis, zeitVon = '00:00', zeitBis = '24:00') {
  const slots = [];
  const [startH, startM] = zeitVon.split(':').map(Number);
  const endMinutes = zeitBis === '24:00' ? 1440 : zeitBis.split(':').map(Number).reduce((h, m) => h * 60 + m);

  const start = new Date(datumVon + 'T00:00:00');
  const end = new Date(datumBis + 'T00:00:00');

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    let cur = startH * 60 + startM;
    while (cur < endMinutes) {
      const h = String(Math.floor(cur / 60)).padStart(2, '0');
      const m = String(cur % 60).padStart(2, '0');
      slots.push(`${dateStr}T${h}:${m}`);
      cur += STEP;
    }
  }
  return slots;
}

export function getDays(slots) {
  return [...new Set(slots.map(s => s.split('T')[0]))];
}

export function getTimes(slots) {
  return [...new Set(slots.map(s => s.split('T')[1]))];
}

const WT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MO = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

export function formatDatum(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return `${WT[d.getDay()]}, ${d.getDate()}. ${MO[d.getMonth()]}`;
}

export function formatDatumKurz(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return { wt: WT[d.getDay()], datum: `${d.getDate()}. ${MO[d.getMonth()]}` };
}

export function formatDatumLang(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return `${WT[d.getDay()]}tag, ${d.getDate()}. ${MO[d.getMonth()]} ${d.getFullYear()}`;
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
