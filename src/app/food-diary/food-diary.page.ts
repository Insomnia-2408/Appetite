import {Component, ViewChild} from '@angular/core';
import {CalendarComponent, CalendarMode, Step} from 'ionic2-calendar/calendar';
import {FoodDiaryService} from '../services/food-diary.service';
import {FoodDiaryModel} from '../models/food-diary.model';
import {PopupService} from '../services/popup.service';
import {BehaviorSubject} from 'rxjs';
import {IonTextarea, ModalController} from '@ionic/angular';
import {AddDiaryEntryModalComponent} from './add-diary-entry-modal/add-diary-entry-modal.component';

@Component({
  selector: 'app-food-diary',
  templateUrl: './food-diary.page.html',
  styleUrls: ['./food-diary.page.scss'],
})
export class FoodDiaryPage {
  public eventSource;
  public viewTitle;

  public isToday: boolean;
  public selectedDate: BehaviorSubject<Date> = new BehaviorSubject<Date>(new Date());
  public foodDiaries: FoodDiaryModel[] = [];
  public selectedFoodDiary: FoodDiaryModel;
  public loadingFoodDiaries: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public timeout: any = null;

  @ViewChild('calendarComponent') calenderComponent: CalendarComponent;
  @ViewChild('notes') notes: IonTextarea;

  public calendar = {
    mode: 'month' as CalendarMode,
    step: 30 as Step,
    currentDate: new Date(),
    dateFormatter: {
      formatMonthViewDay(date: Date) {
        return date.getDate().toString();
      },
      formatMonthViewDayHeader(date: Date) {
        return 'MonMH';
      },
      formatMonthViewTitle(date: Date) {
        return 'testMT';
      },
      formatWeekViewDayHeader(date: Date) {
        return 'MonWH';
      },
      formatWeekViewTitle(date: Date) {
        return 'testWT';
      },
      formatWeekViewHourColumn(date: Date) {
        return 'testWH';
      },
      formatDayViewHourColumn(date: Date) {
        return 'testDH';
      },
      formatDayViewTitle(date: Date) {
        return 'testDT';
      }
    }
  };

  constructor(
    private foodDiaryService: FoodDiaryService,
    private popupService: PopupService,
    private modalController: ModalController
  ) {
  }

  ionViewWillEnter() {
    this.getFoodDiaries();
    this.selectedDate.subscribe(() => {
      this.setSelectedFoodDiary();
    });
  }

  private onKeySearch(event: any) {
    clearTimeout(this.timeout);
    const $this = this;
    this.timeout = setTimeout(() => {
      if (event.keyCode !== 13) {
        $this.updateNote(event.target.value);
      }
    }, 1000);
  }

  private updateNote(value: string) {
    this.foodDiaryService.updateNote(this.selectedFoodDiary.id, value)
      .catch(() => {
        this.popupService.presentToast('Something went wrong when saving your notes');
      }).then(() => {
        this.getFoodDiaries(true);
    });
  }

  public getFoodDiaries(setFoodDiary?: boolean) {
    this.loadingFoodDiaries.next(true);
    this.foodDiaryService.getFoodDiaries().then(foodDiaries => {
      this.foodDiaries = foodDiaries;
      this.loadingFoodDiaries.complete();
      this.loadEvents();
      if (setFoodDiary) {
        this.setSelectedFoodDiary();
      }
    });
  }

  loadEvents() {
    this.eventSource = [];
    this.foodDiaries.forEach(foodDiary => {
      if (foodDiary.diaryEntries.length > 0) {
        const startTime: Date = new Date(foodDiary.createdDatetime);
        startTime.setHours(0, 0, 0, 0);
        const endTime: Date = new Date(foodDiary.createdDatetime);
        endTime.setHours(0, 0, 0, 0);
        endTime.setHours(endTime.getHours() + 24);
        this.eventSource.push({
          title: 'Food diary',
          startTime,
          endTime,
          allDay: true,
        });
      }
    });
    this.calenderComponent.loadEvents();
  }

  onViewTitleChanged(title) {
    this.viewTitle = title;
  }

  today() {
    this.calendar.currentDate = new Date();
  }

  onCurrentDateChanged(event: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    event.setHours(0, 0, 0, 0);
    this.isToday = today.getTime() === event.getTime();
    this.selectedDate.next(event);
  }

  markDisabled = (date: Date) => {
    const current = new Date();
    current.setHours(0, 0, 0);
    return date < current;
  }

  public async setSelectedFoodDiary() {
    await this.loadingFoodDiaries.toPromise().then(() => {
      const existingFoodDiary = this.getDiaryOfSelectedDate();
      if (existingFoodDiary === undefined) {
        this.createNewFoodDiary();
      } else {
        this.selectedFoodDiary = existingFoodDiary;
      }
    });
  }

  private getDiaryOfSelectedDate(): FoodDiaryModel {
    const dateToCompare: Date = this.selectedDate.getValue();
    dateToCompare.setHours(0, 0, 0, 0);
    return this.foodDiaries.find(foodDiary => {
      if (foodDiary.createdDatetime !== null) {
        const date: Date = new Date(foodDiary.createdDatetime);
        date.setHours(0, 0, 0, 0);
        return date.toUTCString() === dateToCompare.toUTCString();
      }
      return false;
    });
  }

  private createNewFoodDiary() {
    this.foodDiaryService.addFoodDiary(this.selectedDate.getValue())
      .catch(() => {
        this.popupService.presentToast('Something went wrong, it\'s not possible to add a meal right now. Try again later');
      })
      .then(() => {
        this.getFoodDiaries(true);
      });
  }

  public async addMeal() {
    const modal = await this.modalController.create({
      component: AddDiaryEntryModalComponent,
      componentProps: {
        foodDiaryId: this.selectedFoodDiary.id
      }
    });
    modal.onDidDismiss().then(() => {
      this.getFoodDiaries(true);
    });
    return await modal.present();
  }

}
