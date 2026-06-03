import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { pool } from '../db/index';

const router = Router();
router.use(authMiddleware);

// GET /api/meals?date=YYYY-MM-DD  or  ?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { date, from, to } = req.query;

  try {
    let result;
    if (date) {
      result = await pool.query(
        'SELECT * FROM meals WHERE user_id = $1 AND date = $2 ORDER BY meal_type',
        [userId, date]
      );
    } else if (from && to) {
      result = await pool.query(
        'SELECT * FROM meals WHERE user_id = $1 AND date >= $2 AND date <= $3 ORDER BY date, meal_type',
        [userId, from, to]
      );
    } else {
      result = await pool.query(
        'SELECT * FROM meals WHERE user_id = $1 ORDER BY date DESC, meal_type',
        [userId]
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/meals
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { date, meal_type, content } = req.body;

  if (!date || !meal_type || !content) {
    res.status(400).json({ error: 'date, meal_type, and content are required' });
    return;
  }

  try {
    const result = await pool.query(
      'INSERT INTO meals (user_id, date, meal_type, content) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, date, meal_type, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/meals/:id
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { date, meal_type, content } = req.body;

  try {
    const check = await pool.query('SELECT id FROM meals WHERE id = $1 AND user_id = $2', [id, userId]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Meal not found' });
      return;
    }

    const result = await pool.query(
      'UPDATE meals SET date = $1, meal_type = $2, content = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [date, meal_type, content, id, userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/meals/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM meals WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Meal not found' });
      return;
    }
    res.json({ message: 'Meal deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
