import {IngredientModel} from './ingredient.model';

export class MeasuredIngredientModel extends IngredientModel{
  amount;
  unit: string;
  checked?: boolean;
}
