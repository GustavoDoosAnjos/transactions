import request from 'supertest';
import express from 'express';
import router from './transactions.js';
import { promises as fs } from 'fs';

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use(router);

describe('Transactions router tests', () => {
  const mockFilePath = 'db/db.json';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('it should create a new transaction', async () => {
    const transaction = {
      valor: 100,
      dataHora: new Date().toISOString(),
    };

    fs.readFile.mockResolvedValueOnce(JSON.stringify([]));
    fs.writeFile.mockResolvedValueOnce();

    const response = await request(app).post('/').send(transaction);

    expect(response.status).toBe(201);
    expect(fs.readFile).toHaveBeenCalledWith(mockFilePath, 'utf8');
    expect(fs.writeFile).toHaveBeenCalledWith(mockFilePath, JSON.stringify([transaction], null, 2), 'utf8');
  });

  it('it should not create a new transaction', async () => {
    const transaction = {
      valor: -100,
      dataHora: new Date().toISOString(),
    };

    const response = await request(app).post('/').send(transaction);

    expect(response.status).toBe(422);
    expect(fs.readFile).not.toHaveBeenCalled();
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it('it should delete all transactions', async () => {
    fs.writeFile.mockResolvedValueOnce();

    const response = await request(app).delete('/');

    expect(response.status).toBe(200);
    expect(fs.writeFile).toHaveBeenCalledWith(mockFilePath, JSON.stringify([], null, 2), 'utf8');
  });

  it('it should create a new file if no db is found', async () => {
    const transaction = {
      valor: 50,
      dataHora: new Date().toISOString(),
    };

    fs.readFile.mockRejectedValueOnce({ code: 'ENOENT' });
    fs.writeFile.mockResolvedValueOnce();

    const response = await request(app).post('/').send(transaction);

    expect(response.status).toBe(201);
    expect(fs.writeFile).toHaveBeenCalledWith(mockFilePath, JSON.stringify([transaction], null, 2), 'utf8');
  });

  it('it should not write invalid json to db', async () => {
    const transaction = {
      valor: 100,
      dataHora: new Date().toISOString(),
    };

    fs.readFile.mockResolvedValueOnce(JSON.stringify([]));
    fs.writeFile.mockRejectedValueOnce(new Error('File write error'));

    const response = await request(app).post('/').send(transaction);

    expect(response.status).toBe(400);
  });
});
