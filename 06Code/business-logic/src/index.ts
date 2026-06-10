import express from 'express';
import dotenv from 'dotenv';
import suppliesBusinessRoutes from './routes/suppliesBusinessRoutes';
import paymentsBusinessRoutes from './routes/paymentsBusinessRoutes';
import patientsBusinessRoutes from './routes/patientsBusinessRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use('/fabuladental/supplies', suppliesBusinessRoutes);
app.use('/fabuladental', paymentsBusinessRoutes);
app.use('/fabuladental/patients', patientsBusinessRoutes);

app.listen(PORT, () => {
  console.log(`Business Logic running`);
});
