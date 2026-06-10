import express from 'express';
import dotenv from 'dotenv';
import suppliesBusinessRoutes from './routes/suppliesBusinessRoutes';
import paymentsBusinessRoutes from './routes/paymentsBusinessRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use('/fabuladental/supplies', suppliesBusinessRoutes);
app.use('/fabuladental', paymentsBusinessRoutes);

app.listen(PORT, () => {
  console.log(`Business Logic running`);
});