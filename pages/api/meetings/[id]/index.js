import { getMeeting } from '../../../../lib/store';

export default function handler(req, res) {
  const { id } = req.query;
  const meeting = getMeeting(id);
  if (!meeting) return res.status(404).json({ fehler: 'Nicht gefunden' });
  res.json(meeting);
}
