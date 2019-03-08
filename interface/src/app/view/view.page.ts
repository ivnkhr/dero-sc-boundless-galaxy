import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { AppComponent, AgentStatus, AgentStatusColors } from '../app.component';
import { ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage';
import { ToastController } from '@ionic/angular';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit, AfterViewInit, OnDestroy {

  constructor(
    public rootApp: AppComponent,
    private route: ActivatedRoute,
    private storage: Storage,
    public toastController: ToastController,
    public db: AngularFireDatabase
  ) {}

  public messages: Observable<any[]>;

  public x = 0;
  public y = 0;

  public glContexts = [];

  public items = [0, 1, 2, 3, 4, 5, 6];
  public dataArray = [null, null, null, null, null, null, null];

  public hover = -1;
  public lock = -1;
  public planet_focus = null;

  public data_ready = false;

  public moto = '';

  async updateView() {

    await this.fetchPlanets();
    this.drawPlanets();

  }

  async ngAfterViewInit() {

  }

  async ngOnInit() {

    console.log('View Init');
    // this.drawPlanets();
    await this.route.paramMap.subscribe(params => {

      this.x = params.params.x;
      this.y = params.params.y;
      this.messages = this.db.list(this.x + ':' + this.y, ref => ref.orderByChild('ts').limitToLast(8) ).valueChanges();

      drawRandomUni(document.querySelector('.local'), this.x + ':' + this.y);
      this.updateView();
      this.update_tip_positions();
    });

  }

  ngOnDestroy() {

    this.glContexts.forEach((item) => {

    });
  }

  private update_tip_positions() {
    try {
      setTimeout( () => {
        // change tip pos
        for (i = 0; i < 7; i++) {
          if ( this.dataArray[i] ) {
            try {
              const planet_elem = document.querySelector('#c' + i);
              const x = window.scrollX + planet_elem.getBoundingClientRect().left; // X
              const y = window.scrollY + planet_elem.getBoundingClientRect().top; // Y
              // console.log(x, y);
              const tip_elem = document.querySelector('.tip_' + i);
              // (10 - Math.random() * 20)
              tip_elem.style.left = x + 45 + (10 - Math.random() * 20) + 'px';
              tip_elem.style.top = y - 10 + (10 - Math.random() * 20) + 'px';
              // console.log(tip_elem, tip_elem.style.left, tip_elem.style.top);
            } catch (err) {
              // err
            }
          }
        }
        this.update_tip_positions();
      }, 3000);
    } catch (err) {
      // err
    }

  }

  public async fetchPlanets() {

    // Fill in dataArray
    // Build nessesary sc_keys
    const keys = [];
    for (i = 0; i < 7; i++) {
      this.dataArray[i] = await this.rootApp.getPlanetFromBlockchainXYZ(this.x, this.y, i);

      const res = await this.fetch_contract(
        ['moto_' + this.rootApp.onChain_position(this.x) + ':' + this.rootApp.onChain_position(this.y)], false, true);
      if ( res != null ) {
        try {
          const contract_keys = res.txs[0].sc_keys;
          this.moto = ['moto_' + this.rootApp.onChain_position(this.x) + ':' + this.rootApp.onChain_position(this.y)];
        } catch (err) {
          // err
        }
      }

      // console.log(this.dataArray[i]);
    }

    // Fill in dataArray
    let i = 0;
    this.dataArray.forEach((item) => {
      // console.log(item);
      if (item !== undefined && item !== null) {
        i++;
      }
    });

    if (i >= 0) {
      this.storage.get(this.x + ':' + this.y).then(async (val) => {

        if (!val && i > 0) {
          const toast = await this.toastController.create({
            message: 'Youve successfully discovered inhabitat sector',
            showCloseButton: true,
            position: 'middle',
            color: 'success',
            duration: 3000,
            closeButtonText: 'OK'
          });
          toast.present();
        }

        // console.log('Contracts', val);
        if (val === null) {
          this.storage.set('sectors_discovered', await this.storage.get('sectors_discovered') + 1);
        }

        this.storage.ready().then(() => {

          this.storage.set(this.x + ':' + this.y, i);
          this.storage.get('total_discovered').then(async (value) => {
            // console.log('new', value);
            this.storage.set('total_discovered', value - val + i);
          });
        });

      });
    }

    this.data_ready = true;
    console.log('fetchPlanets');
    return true;

  }

  drawPlanets() {
    // setTimeout(() => {
    let i = 0;
    this.dataArray.forEach((item) => {
      // console.log(item);
      if (item !== undefined && item !== null) {
        // console.log(i, 'entered', item);
        this.glContexts.push(initPlanet('c' + i, 60, item));
        this.glContexts.push(initPlanet('planetFocus' + i, 300, item));
        // document.getElementById('c' + i).style.setProperty('--planet-size', item.vPlanetMass + 'px');
      }
      i++;
    });
    // console.log('drawPlanets');
    // }, 1000);
  }

  public colonize(slot) {
    console.log(6 - slot);
    this.rootApp.execute_command('PlanetAcquire', {
      position_x: this.rootApp.onChain_position(this.x),
      position_y: this.rootApp.onChain_position(this.y),
      position_z: (slot).toString(),
    }, this.rootApp.settings_laoded.variable_colonize_fee);
  }

  focusCard(id) {
    console.log(id);
    // Pick id from data Array
    const item = this.dataArray[id];
    if (item !== undefined && item !== null) {
      this.planet_focus = item;
      // console.log(item);
      try {
        setTimeout( () => {
          /*
          while (planet_renderer.firstChild) {
            planet_renderer.removeChild(planet_renderer.firstChild);
          }
          */
          /*
          const planet_renderer = document.getElementById ( 'planet_renderer' );
          const no_renderer = document.getElementById ( 'no_renderer' );
          const subject = document.getElementById ( 'planetFocus' + id );

          while (planet_renderer.firstChild) {
            no_renderer.appendChild ( planet_renderer.firstChild );
          }

          planet_renderer.appendChild ( subject );
          */
        }, 100 );
        // setTimeout( () => initPlanet('planetFocus', 300, this.planet_focus), 100 );
      } catch (err) {
        // err
      }
      // console.log('Render Planet', item);
    }
  }

  mouseEnter(div: string) {
    // console.log('mouse enter :' + div);
    this.hover = parseInt( div, 10 );
    // this.rootApp.soundList['beep'].play();
    if (this.lock === -1) {
      this.planet_focus = null;
      this.focusCard(div);
    }
  }

  mouseLeave(div: string) {
    // console.log('mouse leave :' + div);
    this.hover = -1;
    if (this.lock === -1) {
      this.planet_focus = null;
    }
  }

  mouseClick(div: string) {
    if ( this.lock === div ) {
      this.lock = -1;
      this.planet_focus = null;
      // this.ngOnInit();
    } else {
      this.planet_focus = null;
      this.focusCard(div);
      // this.rootApp.soundList['deepbeep'].play();
      this.lock = parseInt( div, 10 );
    }
    this.hover = -1;
  }

}
