import {Injectable} from '@angular/core';
import {AlertController, ToastController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PopupService {

  constructor(private toastController: ToastController, private alertController: AlertController) {
  }

  public async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000
    });
    await toast.present();
  }

  public async showPrompt(header: string, message: string, inputs: Array<Input>, buttons: Array<Button>) {
      const prompt = await this.alertController.create({
        header,
        message,
        inputs,
        buttons
      });
      await prompt.present();
  }
}

interface Input {
  name: string;
  placeholder: string;
}

interface Button {
  text: string;
  handler?: any;
}
