import { Router, Response } from 'express';
import { pool } from '../db/index';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { year } = req.query;
  try {
    let query = 'SELECT * FROM goals WHERE user_id=$1';
    const params: (string | number)[] = [userId];
    if (year) {
      query += ' AND year=$2';
      params.push(year as string);
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { title, category, target_value, current_value, unit, year, deadline } = req.body;
  if (!title) {
    res.status(400).json({ error: 'title required' });
    return;
  }
  try {
    const result = await pool.query(
      `INSERT INTO goals (user_id, title, category, target_value, current_value, unit, year, deadline)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [userId, title, category || null, target_value || null, current_value || 0, unit || null, year || new Date().getFullYear(), deadline || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { title, category, target_value, current_value, unit, year, deadline } = req.body;
  try {
    const check = await pool.query('SELECT id FROM goals WHERE id=$1 AND user_id=$2', [id, userId]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }
    const result = await pool.query(
      `UPDATE goals SET title=$1, category=$2, target_value=$3, current_value=$4, unit=$5, year=$6, deadline=$7
       WHERE id=$8 AND user_id=$9 RETURNING *`,
      [title, category || null, target_value || null, current_value || 0, unit || null, year || new Date().getFullYear(), deadline || null, id, userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM goals WHERE id=$1 AND user_id=$2 RETURNING id', [id, userId]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
