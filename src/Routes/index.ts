import { Router } from 'express';
import offersRouter from './offersRoute';
import recipeRoute from './recipeRoute';

const routes = Router();

routes.use('/pl', offersRouter);

routes.use('/getRecipeData', recipeRoute);

export default routes;
