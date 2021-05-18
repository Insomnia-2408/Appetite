import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor() { }

  public getDefaultImage(): string {
    return '../assets/image/default_image.jpg';
  }

}
