import { getSupabase } from './supabase';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

function mapRow(row) {
  return {
    id: row.id,
    titel: row.titel,
    beschreibung: row.beschreibung,
    teilnehmer: row.teilnehmer,
    datumVon: row.datum_von,
    datumBis: row.datum_bis,
    zeitVon: row.zeit_von,
    zeitBis: row.zeit_bis,
    ersteller: row.ersteller,
    antworten: row.antworten || {},
    notizen: row.notizen || {},
    bestaetigterTag: row.bestaetigter_tag || null,
    erstellt: row.erstellt,
  };
}

export async function createMeeting(data) {
  const supabase = getSupabase();
  const id = generateId();
  const { data: row, error } = await supabase
    .from('meetings')
    .insert({
      id,
      titel: data.titel,
      beschreibung: data.beschreibung || '',
      teilnehmer: data.teilnehmer,
      datum_von: data.datumVon,
      datum_bis: data.datumBis,
      zeit_von: data.zeitVon,
      zeit_bis: data.zeitBis,
      ersteller: data.ersteller,
      antworten: {},
      notizen: {},
      bestaetigter_tag: null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapRow(row);
}

export async function getMeeting(id) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('meetings')
    .select()
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return mapRow(data);
}

export async function addResponse(id, name, slots, notiz = '') {
  const supabase = getSupabase();
  const { data: current, error: fetchError } = await supabase
    .from('meetings')
    .select('antworten, teilnehmer, notizen')
    .eq('id', id)
    .single();
  if (fetchError || !current) return null;

  const updatedAntworten = { ...current.antworten, [name]: slots };
  const updatedTeilnehmer = current.teilnehmer.includes(name)
    ? current.teilnehmer
    : [...current.teilnehmer, name];
  const updatedNotizen = { ...(current.notizen || {}), [name]: notiz };

  const { data, error } = await supabase
    .from('meetings')
    .update({ antworten: updatedAntworten, teilnehmer: updatedTeilnehmer, notizen: updatedNotizen })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data);
}
