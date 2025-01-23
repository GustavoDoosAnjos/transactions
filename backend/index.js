import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json' with { type: "json" };
import { promises as fs } from 'fs';

const app = express();
const port = 3000;
const filePath = 'db/db.json';

app.use(express.json());
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/Health', (req, res) => {
  const data = {
    uptime: process.uptime(),
    message: 'Ok',
    date: new Date(),
  };
  res.status(200).send(data);
});

app.post('/transacao', async (req, res) => {
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

app.delete('/transacao', async (req, res) => {
  await fs.writeFile(filePath, JSON.stringify([], null, 2), 'utf8');

  res.status(200).send();
});

app.get('/estatistica', async (req, res) => {
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

app.listen(port, () => {
  console.log('Elephant Talk.');
});
