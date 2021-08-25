import {Router} from 'express';
import offersRouter from './offersRoute';
import recipeOffersRoute from './recipeOffersRoute';

const routes = Router();

//http://localhost:5000/offer?debug=debug
routes.use('/offer', offersRouter);

// http://localhost:5000/recipeOffers?debug=debug&offerId=17
routes.use('/recipeOffers', recipeOffersRoute);

export default routes;