import {IngredientModel} from './ingredient.model';

export class MeasuredIngredientModel extends IngredientModel{
  parentId: number;
  amount: number;
  unit: string;
}
