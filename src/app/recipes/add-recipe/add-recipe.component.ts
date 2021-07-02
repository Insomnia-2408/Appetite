import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {IngredientModel} from '../../models/ingredient.model';
import {PopupService} from '../../services/popup.service';
import {RecipeService} from '../../services/recipe.service';
import {RecipeScraperService} from '../../services/recipe-scraper.service';
import {RecipeFormComponent} from '../recipe-form/recipe-form.component';
import {MeasuredIngredientModel} from '../../models/measured-ingredient.model';

@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.component.html',
  styleUrls: ['./add-recipe.component.scss'],
})
export class AddRecipeComponent implements OnInit {

  public ingredients: IngredientModel[];
  public loadingIngredients = true;

  @ViewChild('recipeFormComponent') recipeFormComponent: RecipeFormComponent;

  constructor(
    private recipeService: RecipeService,
    private router: Router,
    private popupService: PopupService,
    private recipeScraperService: RecipeScraperService,
  ) {
  }

  ngOnInit() {
    this.loadIngredients();
  }

  private loadIngredients() {
    this.recipeService.getDatabaseState().subscribe(result => {
      if (result) {
        this.recipeService.getIngredients().then(ingredients => {
          this.ingredients = ingredients;
          this.loadingIngredients = false;
        });
      }
    });
  }

  public navigateBack() {
    this.router.navigate(['/recipes']);
  }

  public saveRecipe(recipe) {
    this.recipeService.addRecipe(recipe)
      .catch(() => {
        this.popupService.presentToast('Something went wrong while adding the recipe, try again later');
      })
      .then(() => {
        this.popupService.presentToast('Recipe added');
        this.navigateBack();
      });
  }

  public async openImportRecipe() {
    await this.popupService.showPrompt(
      'Import recipe from web',
      'Add the url to the recipe you want to import. Check the recipe afterward for any discrepancies since it\'s still a beta feature.',
      [
        {
          name: 'url',
          type: 'text',
          placeholder: 'Url of the recipe',
        }
      ],
      [
        {
          text: 'Cancel',
        },
        {
          text: 'Import recipe',
          handler: (data) => {
            if (data.url.trim() !== '') {
              this.importRecipe(data.url);
            }
          }
        }
      ],
    );
  }

  private importRecipe(url: string) {
    try {
      const testUrl = new URL(url);
      this.createNewRecipeFromWeb(url);
    } catch (e) {
      this.popupService.presentToast('Url is invalid!');
    }
  }

  private createNewRecipeFromWeb(url) {
    url = 'http://192.168.50.207:8080?url=' + url;
    this.popupService.presentToast('Recipe is loading');
    this.recipeScraperService.scrape(url).then(async scrapedRecipe => {
      const recipeIngredients = await this.saveNewIngredients(scrapedRecipe.recipeIngredient);
      const recipe = {
        description: scrapedRecipe.description,
        imageUrl: Array.isArray(scrapedRecipe.image) ? scrapedRecipe.image[0] : scrapedRecipe.image,
        ingredients: recipeIngredients,
        instructions: scrapedRecipe.recipeInstructions.join('. '),
        name: scrapedRecipe.name,
        servings: parseInt(scrapedRecipe.recipeYield.replace(/[^\d+]/g, ''), 10),
      };
      this.recipeFormComponent.importRecipe(recipe);
    });
  }

  private async saveNewIngredients(recipeIngredients: string[]): Promise<MeasuredIngredientModel[]> {
    return new Promise<MeasuredIngredientModel[]>((async resolve => {
      await this.recipeService.getIngredients().then(ingredients => {
        const measuredIngredients = [];
        recipeIngredients.forEach(async recipeIngredient => {
          const modifiedIngredientList = recipeIngredient.split(' ');
          let amount = '';
          let unit = '';
          let ingredientName = '';
          if (modifiedIngredientList.length > 2) {
            amount = modifiedIngredientList[0];
            unit = modifiedIngredientList[1];
            ingredientName = modifiedIngredientList[2];
          } else if (modifiedIngredientList.length === 2) {
            amount = modifiedIngredientList[0];
            ingredientName = modifiedIngredientList[1];
          } else {
            ingredientName = modifiedIngredientList[0];
          }
          try {
            const existingIngredient = ingredients.find(ingredient => ingredient.name.toLowerCase() === ingredientName.toLowerCase());
            if (existingIngredient === undefined) {
              await this.recipeService.addIngredient(ingredientName).then(id => {
                measuredIngredients.push({
                  id,
                  ingredientName,
                  amount,
                  unit
                });
              });
            } else {
              measuredIngredients.push({
                id: existingIngredient.id,
                name: existingIngredient.name,
                amount,
                unit
              });
            }
          } catch (e) {
            console.log(`ERROR: ${JSON.stringify(e)}`);
          }
        });
        resolve(measuredIngredients);
      });
    }));
  }

}
