import { OffersController } from './OffersController';
import { RecipeController } from './RecipeController';
// eslint-disable-next-line import/no-cycle
import { LidController } from './LidController';

const offerController = new OffersController();
const recipeController = new RecipeController();
const lidController = new LidController();

export {
  offerController,
  recipeController,
  lidController,
};
