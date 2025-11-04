import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db.js';
import { authMiddleware } from '../middleware.js';

const router = express.Router();

const PLANS = {
  free: { name: 'Free', price: 0 },
  pro: { name: 'Pro', price: 19.99 },
  ultra: { name: 'Ultra', price: 199.99 },
  extreme: { name: 'Extreme', price: 499.99 }
};

// Get available plans
router.get('/plans', (req, res) => {
  res.json(PLANS);
});

// Get user's current subscription
router.get('/current', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const user = await db.get('SELECT plan FROM users WHERE id = ?', [req.user.userId]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const subscription = await db.get(
      'SELECT * FROM subscriptions WHERE user_id = ? AND status = ? ORDER BY started_at DESC LIMIT 1',
      [req.user.userId, 'active']
    );

    res.json({
      plan: user.plan,
      planDetails: PLANS[user.plan],
      subscription: subscription || null
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upgrade/Downgrade subscription
router.post('/upgrade', authMiddleware, async (req, res) => {
  try {
    const { newPlan } = req.body;

    if (!newPlan || !PLANS[newPlan]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const db = getDb();
    const user = await db.get('SELECT plan FROM users WHERE id = ?', [req.user.userId]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Cancel old subscription if not free
    if (user.plan !== 'free') {
      const oldSubscription = await db.get(
        'SELECT id FROM subscriptions WHERE user_id = ? AND status = ? ORDER BY started_at DESC LIMIT 1',
        [req.user.userId, 'active']
      );

      if (oldSubscription) {
        await db.run(
          'UPDATE subscriptions SET status = ? WHERE id = ?',
          ['cancelled', oldSubscription.id]
        );

        // Add cancellation to billing history
        await db.run(
          'INSERT INTO billing_history (id, user_id, subscription_id, amount, plan, type, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [uuidv4(), req.user.userId, oldSubscription.id, PLANS[user.plan].price, user.plan, 'cancellation', 'completed']
        );
      }
    }

    // Create new subscription if not free
    let newSubscription = null;
    if (newPlan !== 'free') {
      const subscriptionId = uuidv4();
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

      await db.run(
        'INSERT INTO subscriptions (id, user_id, plan, price, status, next_billing_date) VALUES (?, ?, ?, ?, ?, ?)',
        [subscriptionId, req.user.userId, newPlan, PLANS[newPlan].price, 'active', nextBillingDate.toISOString()]
      );

      // Add to billing history
      await db.run(
        'INSERT INTO billing_history (id, user_id, subscription_id, amount, plan, type, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), req.user.userId, subscriptionId, PLANS[newPlan].price, newPlan, 'upgrade', 'completed']
      );

      newSubscription = await db.get('SELECT * FROM subscriptions WHERE id = ?', [subscriptionId]);
    } else {
      // Add free plan to billing history
      await db.run(
        'INSERT INTO billing_history (id, user_id, subscription_id, amount, plan, type, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), req.user.userId, null, 0, 'free', 'downgrade', 'completed']
      );
    }

    // Update user plan
    await db.run('UPDATE users SET plan = ? WHERE id = ?', [newPlan, req.user.userId]);

    res.json({
      message: `Successfully upgraded to ${newPlan}`,
      plan: newPlan,
      planDetails: PLANS[newPlan],
      subscription: newSubscription
    });
  } catch (error) {
    console.error('Upgrade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get billing history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const history = await db.all(
      'SELECT * FROM billing_history WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );

    res.json(history);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
