import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { ActivatedRoute, NavigationEnd, ParamMap, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';

import { filter, take } from 'rxjs/operators';

import { CharacterService } from '@shared/services/character.service';
import { Character } from '@shared/interfaces/character.interface';

type RequestInfo = {
  next: string
}

@Component({
  selector: 'app-character-list',
  templateUrl: './character-list.component.html',
  styleUrls: ['./character-list.component.css']
})
export class CharacterListComponent implements OnInit {

  characters: Character[] = [];
  info: RequestInfo = {
    next: null,
  };

  showGoUpButton = false;
  private pageNum = 1;
  private query: string;
  private hideScrollHeight = 200;
  private showScrollHeight = 500;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private characterSvc: CharacterService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.onUrlChange();
  }

  ngOnInit(): void {
    //this.getDataFromService();
    this.getCharactersByQuery();
  }

  @HostListener('window:scroll', [])
  onWindowScroll():void {
    const yOffSet = window.pageYOffset;
    if((yOffSet || this.document.documentElement.scrollTop || this.document.body.scrollTop) > this.showScrollHeight){
      this.showGoUpButton = true;
    }else if(this.showGoUpButton  && (yOffSet || this.document.documentElement.scrollTop || this.document.body.scrollTop) < this.hideScrollHeight){
      this.showGoUpButton = false;
    }
  }

  onScrollTop():void {
    this.document.body.scrollTop = 0; //Safari
    this.document.documentElement.scrollTop = 0; //Other Browsers
  }

  onScrollDown():void {
    if(this.info.next){
      this.pageNum ++;
      this.getDataFromService();
    }
  }

  private getDataFromService(): void {
    this.characterSvc
      .searchCharacters(this.query, this.pageNum)
      .pipe(take(1))
      .subscribe((res: any) => {
        if (res?.results?.length) {
          //console.log('Response: ', res);
          const { info, results } = res;
          this.characters = [...this.characters, ...results];
          this.info = info;
        } else {
          this.characters = [];
        }
      })
  }

  private getCharactersByQuery(): void {
    this.route.queryParams.pipe(
      take(1))
      .subscribe((params: ParamMap) => {
        console.log('Params: ', params);
        this.query = params['q'];
        this.getDataFromService();
      })
  }

  private onUrlChange(): void {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.characters = [];
        this.pageNum = 1;
        this.getCharactersByQuery();
      })
  }

}
