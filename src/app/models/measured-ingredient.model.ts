import {IngredientModel} from './ingredient.model';

export class MeasuredIngredientModel extends IngredientModel{
  amount: number;
  unit: string;
  checked?: boolean;
}
