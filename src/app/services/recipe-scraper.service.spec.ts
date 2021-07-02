import { TestBed } from '@angular/core/testing';

import { RecipeScraperService } from './recipe-scraper.service';

describe('RecipeScraperService', () => {
  let service: RecipeScraperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecipeScraperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
