import { TestBed } from '@angular/core/testing';

import { FoodDiaryService } from './food-diary.service';

describe('FoodDiaryService', () => {
  let service: FoodDiaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoodDiaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
