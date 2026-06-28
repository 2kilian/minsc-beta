import { getMeeting } from '../../../../lib/store';

export default async function handler(req, res) {
  const { id } = req.query;
  const meeting = await getMeeting(id);
  if (!meeting) return res.status(404).json({ fehler: 'Nicht gefunden' });
  res.json(meeting);
}
