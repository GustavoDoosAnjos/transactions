import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json' with { type: "json" };

import transactionsRouter from './src/transactions.js'
import statisticsRouter from './src/statistics.js'

const app = express();
const port = 3000;

app.use(express.json());
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/transacao', transactionsRouter)
app.use('/estatistica', statisticsRouter)

app.get('/Health', (req, res) => {
  const data = {
    uptime: process.uptime(),
    message: 'Ok',
    date: new Date(),
  };
  res.status(200).send(data);
});


app.listen(port);

export default app;
