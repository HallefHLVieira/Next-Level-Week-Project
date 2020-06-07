import express, { request, response } from 'express';

import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsController';


//Index, Show, Create, Update, Delete

const routes = express.Router();
const pointsController = new PointsController();
const itemsController = new ItemsController();


routes.get('/items', itemsController.index);
routes.get('/points', pointsController.index);
routes.post('/points', pointsController.create);
routes.get('/points/:id', pointsController.show);


export default routes;
