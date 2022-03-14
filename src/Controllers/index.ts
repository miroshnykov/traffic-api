import { OffersController } from './OffersController';
import { RecipeController } from './RecipeController';
import { LidController } from './LidController';

const offerController = new OffersController();
const recipeController = new RecipeController();
const lidController = new LidController();

export {
  offerController,
  recipeController,
  lidController,
};
