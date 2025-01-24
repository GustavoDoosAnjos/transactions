import express from 'express';
import { promises as fs } from 'fs';

const filePath = 'db/db.json';
const router = express.Router();

router.post('', async (req, res) => {
  const transaction = req.body;
  const today = new Date().getTime();
  const transactionDate = new Date(transaction.dataHora).getTime();
  const isValidTime = today - transactionDate > 0;
  const isValidTransaction = transaction?.valor && transaction?.valor > 0;

  if (!isValidTransaction && isValidTime) {
    return res.status(422).send();
  }

  try {
    let transactions = [];
    try {
      const data = await fs.readFile(filePath, 'utf8');
      transactions = JSON.parse(data);
    } catch (err) {
      if (err.code === 'ENOENT') {
        await fs.writeFile(filePath, JSON.stringify([], null, 2), 'utf8');
        transactions = [];
      } else {
        throw err;
      }
    }

    transactions.push(transaction);

    await fs.writeFile(filePath, JSON.stringify(transactions, null, 2), 'utf8');

    res.status(201).send();
  } catch (error) {
    res.status(400).send();
  }
});

router.delete('', async (req, res) => {
  await fs.writeFile(filePath, JSON.stringify([], null, 2), 'utf8');

  res.status(200).send();
});

export default router;
