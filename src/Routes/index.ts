import { Router } from 'express';
import offersRouter from './offersRoute';
import recipeRoute from './recipeRoute';
import lidRoute from './lidRoute';

const routes = Router();

routes.use('/pl', offersRouter);

routes.use('/getRecipeData', recipeRoute);

routes.use('/lid', lidRoute);

export default routes;
