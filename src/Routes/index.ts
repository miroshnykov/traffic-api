import { Router } from 'express';
// eslint-disable-next-line import/no-cycle
import offersRouter from './offersRoute';
// eslint-disable-next-line import/no-cycle
import recipeRoute from './recipeRoute';
// eslint-disable-next-line import/no-cycle
import lidRoute from './lidRoute';

const routes = Router();

routes.use('/pl', offersRouter);

routes.use('/getRecipeData', recipeRoute);

routes.use('/lid', lidRoute);

export default routes;
