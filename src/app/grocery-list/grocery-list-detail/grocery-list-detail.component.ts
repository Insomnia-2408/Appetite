import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {GroceryListService} from '../../services/grocery-list.service';
import {GroceryListModel} from '../../models/grocery-list.model';
import {GroceryListFormComponent} from '../grocery-list-form/grocery-list-form.component';
import {PopupService} from '../../services/popup.service';
import {SocialSharing} from '@ionic-native/social-sharing/ngx';

@Component({
  selector: 'app-grocery-list-detail',
  templateUrl: './grocery-list-detail.component.html',
  styleUrls: ['./grocery-list-detail.component.scss'],
})
export class GroceryListDetailComponent implements OnInit {

  public groceryListId;
  public groceryList: GroceryListModel;
  public loadingGroceryList = true;

  @ViewChild('groceryListFormComponent') groceryListFormComponent: GroceryListFormComponent;

  constructor(
    private router: Router,
    private groceryListService: GroceryListService,
    private activatedRoute: ActivatedRoute,
    private popupService: PopupService,
    private socialSharing: SocialSharing,
  ) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.groceryListId = params.id;
      this.loadGroceryList();
    });
  }

  ionViewWillLeave() {
    try {
      this.groceryListService.editGroceryList(this.groceryListFormComponent.getGroceryList())
        .catch(() => {
          this.popupService.presentToast(`Something went wrong when saving ${this.groceryList.name}`);
        });
    } catch (error) {
      this.popupService.presentToast(
        `When trying to save the grocery list the following error occured: ${error.getMessage()}`,
      );
    }
  }

  public loadGroceryList() {
    this.groceryListService.getDatabaseState().subscribe(result => {
      if (result) {
        this.groceryListService.getGroceryList(this.groceryListId).then(groceryList => {
          this.groceryList = groceryList;
          this.loadingGroceryList = false;
        });
      }
    });
  }

  public navigateBack() {
    this.router.navigate(['/grocery-list']);
  }

  public openRemoveGroceryList() {
    this.popupService.showPrompt(
      `Remove ${this.groceryList.name}`,
      `Are you certain that you want to remove ${this.groceryList.name}?`,
      [],
      [
        {
          text: 'Cancel',
        },
        {
          text: 'Yes I\'m sure',
          handler: () => {
            this.removeGroceryList();
          }
        }
      ]
    );
  }

  private removeGroceryList() {
    this.groceryListService.removeGroceryList(this.groceryList)
      .catch(() => {
        this.popupService.presentToast('Something went wrong while removing the grocery list, try again later');
      })
      .then(() => {
        this.popupService.presentToast(`${this.groceryList.name} was removed`);
        this.navigateBack();
      });
  }

  public share() {
    const message = this.getGroceryListForSharing();
    this.socialSharing.share(message, 'MEDIUM', null, null)
      .catch(error => {
        console.log(JSON.stringify(error));
      })
      .then(data => {
        console.log(JSON.stringify(data));
      });
  }

  private getGroceryListForSharing(): string {
    const messageArray: string[] = [];
    this.groceryListFormComponent.getGroceryList().groceries.forEach(grocery => {
      grocery.checked.toString() === 'true' ? grocery.checked = true : grocery.checked = false;
      let message = `- ${this.getIngredientName(grocery.id)} ${grocery.amount} ${grocery.unit}`;
      if (grocery.checked) {
        message = '~' + message + '~';
      }
      messageArray.push(message);
    });
    return messageArray.join('\n');
  }

  private getIngredientName(id): string {
    return this.groceryListFormComponent.ingredients.find(ingredient => ingredient.id === id).name;
  }
}
