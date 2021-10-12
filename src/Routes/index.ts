import {Router} from 'express';
import offersRouter from './offersRoute';
import recipeRoute from './recipeRoute';

const routes = Router();

//http://localhost:5000/offer?debug=debug
//http://localhost:5000/ad?offer=b6147f1943973ce167f81096f084ae19:b0c52182003f7e0a4b63b75b3069b33ca0f09a4d42718a054d952acd7b54fb5f&debugging=debugging
//https://co-traffic.jatun.systems/
routes.use('/ad', offersRouter);

// http://localhost:5000/getRecipeData?debugging=debugging&offerId=35784
// https://co-traffic.jatun.systems/getRecipeData?debugging=debugging&offerId=35784
routes.use('/getRecipeData', recipeRoute);

export default routes;