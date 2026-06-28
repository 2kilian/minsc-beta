if (!global._meetings) {
  global._meetings = new Map();
}
const meetings = global._meetings;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

export function createMeeting(data) {
  const id = generateId();
  const meeting = {
    id,
    titel: data.titel,
    beschreibung: data.beschreibung || '',
    teilnehmer: data.teilnehmer,
    datumVon: data.datumVon,
    datumBis: data.datumBis,
    zeitVon: data.zeitVon,
    zeitBis: data.zeitBis,
    ersteller: data.ersteller,
    antworten: {},
    erstellt: new Date().toISOString(),
  };
  meetings.set(id, meeting);
  return { ...meeting };
}

export function getMeeting(id) {
  const m = meetings.get(id);
  return m ? { ...m, antworten: { ...m.antworten } } : null;
}

export function addResponse(id, name, slots) {
  const meeting = meetings.get(id);
  if (!meeting) return null;
  meeting.antworten[name] = slots;
  return { ...meeting, antworten: { ...meeting.antworten } };
}
