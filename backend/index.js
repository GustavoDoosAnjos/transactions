import express from 'express';
import { promises as fs } from 'fs';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hi.');
});

app.post('/transacao', async (req, res) => {
  const transaction = req.body;

  if (!transaction?.valor || !transaction?.dataHora) {
    return res.status(400).send('Valor e data são obrigatórios.');
  }

  try {
    const filePath = 'db/file.json';

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

    res.status(201).send('Transaction created successfully.');
  } catch (error) {
    res.status(500).send('Internal Server Error.');
  }
});

app.listen(port, () => {
  console.log('Elephant Talk.');
});
