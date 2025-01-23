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

  // TODO VALIDAÇÕES

  if (!transaction?.valor || !transaction?.dataHora) {
    return res.status(422).send();
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

    res.status(201).send();
  } catch (error) {
    res.status(400).send();
  }
});

app.get('/estatistica', async (req, res) => {
  const filePath = 'db/file.json';

  try {
    const data = await fs.readFile(filePath, 'utf8');
    const transactions = JSON.parse(data);

    const statistics = {
      count: 0,
      sum: 0,
      avg: 0,
      min: Infinity,
      max: 0,
    };

    if (transactions.length > 0) {
      statistics['count'] = transactions.length;
      transactions.map((item) => {
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
    res.status(500).send();
  }
});

app.listen(port, () => {
  console.log('Elephant Talk.');
});
