import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AppComponent, AgentStatus, AgentStatusColors } from '../app.component';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit, AfterViewInit {

  constructor(
    public rootApp: AppComponent,
    public toastController: ToastController
  ) {
    console.log(AgentStatus[this.rootApp.wallet_status]);
    console.log(AgentStatus[this.rootApp.daemon_status]);
  }

  private boundries = 999;
  public items = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  public canNav = true;
  public y = 0;
  public x = 0;
  public cy = 0;
  public cx = 0;
  public dataArray = [];

  AgentStatus = AgentStatus;
  AgentStatusColors = AgentStatusColors;

  public async get(position) {
    console.log(position);
    return await this.rootApp.storage.get(position);
  }

  async ngAfterViewInit() {
    // this.ngOnInit();
  }

  ngOnInit() {
    this.canNav = false;
    // drawRandom(document.querySelector('.galaxy'), this.x + ':' + this.y);

    (document.querySelector('.galaxy') as HTMLElement).style.backgroundColor =
    '#' + Math.floor((Math.abs(Math.sin(this.x + this.y + 7) * 16777215)) % 16777215).toString(16);


    // load state of sectors
    // this.rootApp.storage.ready().then(() => {
      // const position_data = this.rootApp.storage.get(this.x + ':' + this.y);
    for (let j = 0; j < 9; j++) {
      for (let i = 0; i < 9; i++) {
        // console.log( j * 9 + i );
        // this.dataArray[ j * 9 + i ] =
        this.rootApp.storage.get( ( i + 1 - 5 + (this.y * 8) )  + ':' + ( j + 1 - 5 + (this.x * 8) ) ).then((value) => {
          this.dataArray[ j * 9 + i ] = (value);
        });
        // console.log(this.dataArray[ j * 9 + i ] );
        // console.log( ( i + 1 - 5 + (this.y * 8) ) + ':' + ( j + 1 - 5 + (this.x * 8) ) );
      }
    }
    // });


    setTimeout(() => {
      this.canNav = true;
      console.log(this.canNav);
    }, 500);
  }

  public async jumpTo() {
    if (this.canNav) {
      if (this.cy < -this.boundries || this.cy > this.boundries || this.cx < -this.boundries || this.cx > this.boundries ) {
        const toast = await this.toastController.create({
          message: 'Youve requested coordinates that are out of bounderies of a galaxy',
          showCloseButton: true,
          position: 'middle',
          color: 'warning',
          closeButtonText: 'OK'
        });
        toast.present();
        return;
      }
      this.x = this.cx;
      this.y = this.cy;
      this.ngOnInit();
    }
  }

  public async navigate(y, x) {
    console.log(this.y + y, this.x + x);
    if (this.y + y < -this.boundries || this.y + y > this.boundries || this.x + x < -this.boundries || this.x + x > this.boundries ) {
      const toast = await this.toastController.create({
        message: 'Youve reached the edge of a galaxy',
        showCloseButton: true,
        position: 'middle',
        color: 'warning',
        closeButtonText: 'OK'
      });
      toast.present();
      return;
    }
    if (this.canNav) {
      this.x += x;
      this.y += y;
      this.cx = this.x;
      this.cy = this.y;
      this.ngOnInit();
    }
  }

}
