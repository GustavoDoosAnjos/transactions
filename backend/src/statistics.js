import express from 'express';
import { promises as fs } from 'fs';

const filePath = 'db/db.json';
const router = express.Router();

router.get('', async (req, res) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const transactions = JSON.parse(data);

    const now = new Date();
    const oneMinuteEarlier = new Date(now.getTime() - 1 * 60 * 1000);
    const validTransactions = transactions.filter((item) => {
      const itemDate = new Date(item.dataHora);
      return itemDate >= oneMinuteEarlier && itemDate <= now;
    });

    const statistics = {
      count: 0,
      sum: 0,
      avg: 0,
      min: Infinity,
      max: 0,
    };

    if (validTransactions.length > 0) {
      statistics['count'] = validTransactions.length;
      validTransactions.map((item) => {
        statistics['sum'] += item.valor;
        statistics['min'] = Math.min(statistics['min'], item.valor);
        statistics['max'] = Math.max(statistics['min'], item.valor);
        statistics['avg'] = statistics['sum'] / statistics['count'];
      });
    } else {
      statistics['min'] = 0;
    }

    res.status(200).send(JSON.stringify(statistics));
  } catch (err) {
    console.error(err);
  }
});

export default router;
