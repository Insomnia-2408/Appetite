import {MeasuredIngredientModel} from './measured-ingredient.model';

export class RecipeModel {
  id: number;
  name: string;
  description: string;
  instructions: string;
  imageUrl: string;
  ingredients: Array<MeasuredIngredientModel>;
}
