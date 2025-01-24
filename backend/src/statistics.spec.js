import request from 'supertest';
import express from 'express';
import router from './statistics.js';
import { promises as fs } from 'fs';

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use(router);

describe('Statistics router tests', () => {
  const mockFilePath = 'db/db.json';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should get statistics', async () => {
    const transaction = {
      valor: 100,
      dataHora: new Date().toISOString(),
    };
    const transactions = [transaction, transaction];
    const expectedResult = JSON.stringify({
      count: 2,
      sum: 200,
      avg: 100,
      min: 100,
      max: 100,
    });

    fs.readFile.mockResolvedValueOnce(JSON.stringify(transactions));

    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toBe(expectedResult);
    expect(fs.readFile).toHaveBeenCalledWith(mockFilePath, 'utf8');
  });

  test('should get statistics', async () => {
    const transaction = {
      valor: 100,
      dataHora: '2020-08-07T12:34:56.789-03:00',
    };
    const transactions = [transaction, transaction];
    const expectedResult = JSON.stringify({
      count: 0,
      sum: 0,
      avg: 0,
      min: 0,
      max: 0,
    });

    fs.readFile.mockResolvedValueOnce(JSON.stringify(transactions));

    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toBe(expectedResult);
    expect(fs.readFile).toHaveBeenCalledWith(mockFilePath, 'utf8');
  });
});
