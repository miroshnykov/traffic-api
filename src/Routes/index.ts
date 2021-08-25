import {Router} from 'express';
import offersRouter from './offersRoute';
import recipeOffersRoute from './recipeOffersRoute';

const routes = Router();

//http://localhost:5000/offer?debug=debug
//http://localhost:5000/offer?ad=b6147f1943973ce167f81096f084ae19:b0c52182003f7e0a4b63b75b3069b33ca0f09a4d42718a054d952acd7b54fb5f&debug=debug
routes.use('/offer', offersRouter);

// http://localhost:5000/recipeOffers?debug=debug&offerId=17
routes.use('/recipeOffers', recipeOffersRoute);

export default routes;