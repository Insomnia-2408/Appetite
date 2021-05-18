import {MeasuredIngredientModel} from './measured-ingredient.model';

export class GroceryListModel {
  id: number;
  name: string;
  createdDatetime: Date;
  groceries: Array<MeasuredIngredientModel>;
}
