import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { AppComponent, AgentStatus, AgentStatusColors } from '../app.component';
import { ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage';
import { ToastController } from '@ionic/angular';

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
    public toastController: ToastController
  ) {}

  public x = 0;
  public y = 0;

  public glContexts = [];

  public items = [0, 1, 2, 3, 4, 5, 6];
  public dataArray = [null, null, null, null, null, null, null];

  public hover = -1;
  public lock = -1;
  public planet_focus = null;

  public data_ready = false;

  async updateView() {

    await this.fetchPlanets();
    this.drawPlanets();

  }

  async ngAfterViewInit() {

    // updateView();
    console.log('coordinates', this.x, this.y);
    this.updateView();

  }

  async ngOnInit() {

    console.log('View Init');
    // this.drawPlanets();
    await this.route.paramMap.subscribe(params => {
      // console.log(params.params.x, params.params.y);
      this.x = params.params.x;
      this.y = params.params.y;

      drawRandomUni(document.querySelector('.local'), this.x + ':' + this.y);
      // this.fetchPlanets();

      // this.drawPlanets();
    });

  }

  ngOnDestroy() {
    console.log('unload planets');
    this.glContexts.forEach((item) => {
      // document.removeChild(item);
      // item.getExtension('WEBGL_lose_context').loseContext();
    });
  }

  public async fetchPlanets() {

    // Fill in dataArray

    const loading = await this.rootApp.presentLoadingWithOptions('Loading Sector State');

    let setoff = {};
    setoff = {};
    setoff.vPlanetMass = 60;

    setoff.RARECloudiness = 1;
    setoff.RARECold = 1;
    setoff.RAREOcean = 1;
    setoff.RARETemperate = 1;
    setoff.RAREWarm = 1;
    setoff.RAREHot = 1;
    setoff.RARESpeckle = 1;
    setoff.RAREClouds = 1;
    setoff.RARELightColor = 1;
    setoff.RAREHaze = 1;

    const rarity_rate =
    setoff.RARECloudiness +
    setoff.RARECold +
    setoff.RAREOcean +
    setoff.RARETemperate +
    setoff.RAREWarm +
    setoff.RAREHot +
    setoff.RARESpeckle +
    setoff.RAREClouds +
    setoff.RARELightColor +
    setoff.RAREHaze;

    setoff.vRarityRate = 0;
    if ( rarity_rate >= 3 ) { setoff.vRarityRate = 1; }
    if ( rarity_rate >= 6 ) { setoff.vRarityRate = 2; }
    if ( rarity_rate >= 9 ) { setoff.vRarityRate = 3; }

    setoff.vWaterLevel = 0; // 0-40
    setoff.vRivers = 0; // 0-100
    setoff.vTemperature = 0; // 0-40
    setoff.vCloudiness = 0; // 0-20

    setoff.vCold_r = 44; // 0-100
    setoff.vCold_g = 13; // 0-100
    setoff.vCold_b = 14; // 0-100

    setoff.vOcean_r = 17; // 0-100
    setoff.vOcean_g = 18; // 0-100
    setoff.vOcean_b = 19; // 0-100

    setoff.vTemperate_r = 60; // 0-100
    setoff.vTemperate_g = 70; // 0-100
    setoff.vTemperate_b = 10; // 0-100

    setoff.vWarm_r = 60; // 0-100
    setoff.vWarm_g = 60; // 0-100
    setoff.vWarm_b = 60; // 0-100

    setoff.vHot_r = 60; // 0-100
    setoff.vHot_g = 60; // 0-100
    setoff.vHot_b = 60; // 0-100

    setoff.vSpeckle_r = 60; // 0-100
    setoff.vSpeckle_g = 60; // 0-100
    setoff.vSpeckle_b = 60; // 0-100

    setoff.fixtures01 = 10; // 0-20
    setoff.fixtures02 = 30; // 0-100
    setoff.fixtures03 = 50; // 0-100
    setoff.fixtures04 = 0; // 0-10
    setoff.fixtures05 = 0; // 0-7
    setoff.fixtures06 = 110; // 0-220
    setoff.fixtures07 = 40; // 0-80
    setoff.fixtures08 = 5; // 0-9
    setoff.fixtures09 = 7; // 0-20

    setoff.vAngle = 0; // 0-60
    setoff.vRotspeed = 0; // 0-20

    this.dataArray[1] = JSON.parse(JSON.stringify(setoff));

    setoff.vRarityRate = 0;
    this.dataArray[2] = JSON.parse(JSON.stringify(setoff));

    setoff.vRarityRate = 1;
    this.dataArray[3] = JSON.parse(JSON.stringify(setoff));

    setoff.vRarityRate = 2;
    this.dataArray[4] = JSON.parse(JSON.stringify(setoff));


    loading.dismiss();

    // Fill in dataArray

    let i = 0;
    this.dataArray.forEach((item) => {
      // console.log(item);
      if (item !== undefined && item !== null) {
        i++;
      }
    });

    console.log(i);

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

        this.storage.ready().then(() => {
          this.storage.set(this.x + ':' + this.y, i);
        });

      });
    }



/*
    setoff.RARECloudiness = 0;
    setoff.RARECold = 0;
    setoff.RAREOcean = 0;

    this.dataArray[6] = setoff;
    */

    this.data_ready = true;

    return true;

  }

  drawPlanets() {
    // setTimeout(() => {
    let i = 0;
    this.dataArray.forEach((item) => {
      // console.log(item);
      if (item !== undefined && item !== null) {
        console.log(i, 'entered', item);
        this.glContexts.push(initPlanet('c' + i, 60, item));
        // document.getElementById('c' + i).style.setProperty('--planet-size', item.vPlanetMass + 'px');
      }
      i++;
    });
    // }, 1000);
  }

  focusCard(id) {
    console.log(id);
    // Pick id from data Array
    const item = this.dataArray[id];
    if (item !== undefined && item !== null) {
      this.glContexts.push(initPlanet('planetFocus', 300, this.dataArray[id]));
      console.log('Render Planet');
      this.planet_focus = this.dataArray[id];
    }
  }

  mouseEnter(div: string) {
    console.log('mouse enter :' + div);
    this.hover = div;
    if (this.lock === -1) {
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
      this.lock = div;
    }
    this.hover = -1;
  }

}
