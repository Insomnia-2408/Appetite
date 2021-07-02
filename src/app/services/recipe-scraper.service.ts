import {Injectable} from '@angular/core';
import {ScrapedRecipe} from '../models/scraped-recipe';
import {parse} from 'node-html-parser';

@Injectable({
  providedIn: 'root'
})
export class RecipeScraperService {

  constructor() {
  }

  private fetchStructuredData(document) {

    const scripts: NodeListOf<Element> = document.querySelectorAll('script[type="application/ld+json"]');
    let foundRecipe = null;
    // @ts-ignore
    for (const script of scripts) {
      try {
        const scriptContent = JSON.parse(script.textContent);

        if (this.validSchemaUrls().indexOf(scriptContent['@context']) === -1) {
          continue;
        }

        foundRecipe = this.parseStructuredData(scriptContent);
        if (foundRecipe) {
          break;
        }

      } catch (exception) {
        throw exception;
      }
    }

    if (foundRecipe) {
      return foundRecipe;
    }

    for (const schemaUrl of this.validSchemaUrls(false)) {
      const element = document.querySelector('[itemtype="' + schemaUrl + '/Recipe"]');
      if (!element) {
        continue;
      }
      const allPropContents = {};

      // @ts-ignore
      for (const itemPropElement of element.querySelectorAll('[itemprop]')) {
        const attributes = itemPropElement.attributes;
        const value = attributes.content ? attributes.content : itemPropElement.innerText;
        if (allPropContents[attributes.itemprop]) {
          if (!Array.isArray(allPropContents[attributes.itemprop])) {
            allPropContents[attributes.itemprop] = [
              allPropContents[attributes.itemprop]
            ];
          }
          allPropContents[attributes.itemprop].push(value);
        } else {
          allPropContents[attributes.itemprop] = value;
        }
      }
      foundRecipe = this.parseRecipe(allPropContents);
    }

    return foundRecipe;

  }

  private parseStructuredData(data) {

    if (data['@graph'] && Array.isArray(data['@graph'])) {
      for (const subData of data['@graph']) {
        const recipe = this.parseStructuredData(subData);
        if (recipe) {
          return recipe;
        }
      }
    }

    if (data['@type'] === 'Recipe') {
      return this.parseRecipe(data);
    }

    return null;
  }

  private validSchemaUrls(trailingSlash = true): string[] {
    return [
      'https://schema.org', 'http://schema.org',
      'https://www.schema.org', 'http://www.schema.org',
    ]
      .concat(trailingSlash ? [
        'https://schema.org/', 'http://schema.org/',
        'https://www.schema.org/', 'http://www.schema.org/',
      ] : []);
  }

  private parseRecipe(scriptContent: any) {
    const recipe = new ScrapedRecipe();
    recipe.name = this.smartFilterRawText(scriptContent.name);
    recipe.alternateName = this.smartFilterRawText(scriptContent.alternateName);
    recipe.URL = scriptContent.URL;
    recipe.totalTime = scriptContent.totalTime;
    recipe.image = this.parseImage(scriptContent.image);
    recipe.description = this.smartFilterRawText(scriptContent.descriptScrapedRecipeion);
    recipe.recipeYield = this.smartFilterRawText(scriptContent.recipeYield);
    recipe.recipeCategory = this.smartFilterRawText(scriptContent.recipeCategory);
    recipe.recipeCuisine = this.smartFilterRawText(scriptContent.recipeCuisine);

    recipe.recipeIngredient = this.smartParseList(scriptContent.recipeIngredient, this.isValidIngredient, this.smartFilterRawText);
    recipe.recipeInstructions = this.smartParseList(scriptContent.recipeInstructions, this.isValidStep, this.smartFilterRawText);

    return recipe;
  }

  private parseImage(image) {
    if (typeof image === 'object') {
      return image.url ? image.url : '';
    }

    return image;
  }

  private smartParseList(list: any, verifyFunc, filter): Array<string> {
    let parsedList = [];
    switch (typeof list) {
      case 'string':
        const splitted = list.split(/<[^>]+>|[\n\r]/g);
        for (const element of splitted) {
          if (verifyFunc(element)) {
            parsedList.push(filter(element));
          }
        }
        break;
      case 'object':
        const isArr = Array.isArray(list);
        if (!isArr) {
          parsedList = this.parseListOfType(list, verifyFunc, filter);
          break;
        }
        for (const element of list) {
          if (typeof element === 'object') {
            parsedList = [...parsedList, ...this.parseListOfType(element, verifyFunc, filter)];
          } else if (verifyFunc(element)) {
            const val = isArr ? element : element.text;
            parsedList.push(filter(val));
          }
        }
        break;
    }
    return parsedList;
  }

  private parseListOfType(obj, verifyFunc, filter) {
    let list = [];

    if (obj['@type']) {
      switch (obj['@type']) {
        case 'HowToSection':
          for (const howTo of obj.itemListElement) {
            list = [...list, ...this.parseListOfType(howTo, verifyFunc, filter)];
          }
          break;
        case 'HowToStep':
          if (verifyFunc(obj.text)) {
            list = [filter([obj.text])];
          }
          break;
      }
    } else {
      for (const element of obj) {
        if (verifyFunc(element)) {
          const val = element.text ? element : element.text;
          if (verifyFunc(val)) {
            list = [filter(val)];
          }
        }
      }
    }

    return list;
  }

  private smartFilterRawText(val) {
    return String(val).replace(/<[^><]+>/g, '').trim();
  }

  private isValidStep(step) {
    return String(step).trim().length > 5;
  }

  private isValidIngredient(step) {
    return step.trim().length > 2;
  }

  scrape(url: string): Promise<ScrapedRecipe> {
    return new Promise((acc, rej) => {
      fetch(url)
        .then(response => response.text())
        .then(html => {
          try {
            const document = parse(html);
            const recipe = this.fetchStructuredData(document);
            acc(recipe);
          } catch (err) {
            rej(err);
          }
        });
    });
  }

}
