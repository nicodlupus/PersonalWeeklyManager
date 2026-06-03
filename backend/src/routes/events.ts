import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { pool } from '../db/index';

const router = Router();
router.use(authMiddleware);

// GET /api/events?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { from, to } = req.query;

  try {
    let query: string;
    let params: unknown[];

    if (from && to) {
      query = `SELECT * FROM events WHERE user_id = $1 AND date >= $2 AND date <= $3 ORDER BY date, time_start NULLS LAST`;
      params = [userId, from, to];
    } else {
      query = `SELECT * FROM events WHERE user_id = $1 ORDER BY date DESC, time_start NULLS LAST`;
      params = [userId];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/events
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { title, date, time_start, time_end, category, points, notes, is_recurring, recur_rule } = req.body;

  if (!title || !date) {
    res.status(400).json({ error: 'Title and date are required' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO events (user_id, title, date, time_start, time_end, category, points, notes, is_recurring, recur_rule)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [userId, title, date, time_start || null, time_end || null, category || null, points || null, notes || null, is_recurring || false, recur_rule || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/events/:id
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { title, date, time_start, time_end, category, points, notes, is_recurring, recur_rule } = req.body;

  try {
    const check = await pool.query('SELECT id FROM events WHERE id = $1 AND user_id = $2', [id, userId]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const result = await pool.query(
      `UPDATE events SET title = $1, date = $2, time_start = $3, time_end = $4, category = $5,
       points = $6, notes = $7, is_recurring = $8, recur_rule = $9 WHERE id = $10 AND user_id = $11 RETURNING *`,
      [title, date, time_start || null, time_end || null, category || null, points || null, notes || null, is_recurring || false, recur_rule || null, id, userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/events/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
