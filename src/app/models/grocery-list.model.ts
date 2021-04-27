import {MeasuredIngredientModel} from './measured-ingredient.model';

export class GroceryListModel {
  id: number;
  name: string;
  createdDatetime: Date;
  ingredients: Array<MeasuredIngredientModel>;
}
