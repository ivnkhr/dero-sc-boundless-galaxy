import { Component, OnInit, Input } from '@angular/core';

declare function initPlanet(ctx: any, wh: any, setoff: any);

@Component({
  selector: 'app-planetrenderer',
  templateUrl: './planetrenderer.component.html',
  styleUrls: ['./planetrenderer.component.scss']
})
export class PlanetrendererComponent implements OnInit {

  @Input() item: any;

  constructor() { }

  ngOnInit() {
    setTimeout( () => { initPlanet('planetFocusList' + this.item.i, 140, this.item); }, 1 );
    // console.log(this.item.i);
  }

}
