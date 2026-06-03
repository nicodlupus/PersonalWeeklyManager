import { Router, Response } from 'express';
import { pool } from '../db/index';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { date } = req.query;
  try {
    let query = 'SELECT * FROM meals WHERE user_id = $1';
    const params: (string | number)[] = [userId];
    if (date) {
      query += ' AND date = $2';
      params.push(date as string);
    }
    query += ' ORDER BY date, meal_type';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { date, meal_type, content } = req.body;
  if (!date || !meal_type || !content) {
    res.status(400).json({ error: 'date, meal_type, and content required' });
    return;
  }
  try {
    const result = await pool.query(
      'INSERT INTO meals (user_id, date, meal_type, content) VALUES ($1,$2,$3,$4) RETURNING *',
      [userId, date, meal_type, content]
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
  const { date, meal_type, content } = req.body;
  try {
    const check = await pool.query('SELECT id FROM meals WHERE id=$1 AND user_id=$2', [id, userId]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Meal not found' });
      return;
    }
    const result = await pool.query(
      'UPDATE meals SET date=$1, meal_type=$2, content=$3 WHERE id=$4 AND user_id=$5 RETURNING *',
      [date, meal_type, content, id, userId]
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
    const result = await pool.query('DELETE FROM meals WHERE id=$1 AND user_id=$2 RETURNING id', [id, userId]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Meal not found' });
      return;
    }
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
