import path from 'path'

import express from 'express';
import dotenv from 'dotenv';
import { getDevLogger } from './helpers';
// import { RegisterRoutes } from './rest-api/routes';

dotenv.config();
const PORT = process.env.PORT || 3000;

const logger = getDevLogger();
const app = express();

app.use(express.json());

// RegisterRoutes(app);

const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

app.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}`)
})

