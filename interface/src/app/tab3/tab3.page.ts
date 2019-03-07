import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppComponent, AgentStatus, AgentStatusColors } from '../app.component';
import { NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit, OnDestroy {

  constructor(
    public rootApp: AppComponent,
    public router: Router
  ) {
    console.log(AgentStatus[this.rootApp.wallet_status]);
    console.log(AgentStatus[this.rootApp.daemon_status]);
  }

  AgentStatus = AgentStatus;
  AgentStatusColors = AgentStatusColors;

  private routeSub: any;  // subscription to route observer

/*
  public ngOnInit() {
    // Register to Angular navigation events to detect navigating away (so we can save changed settings for example)
    this.routeSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.saveEndpoints();
      }
    });
  }

  public ngOnDestroy() {
    this.routeSub.unsubscribe();
  }
*/

  ionViewDidLeave() {
    this.saveEndpoints();
  }

  public saveEndpoints() {
    console.log('Endpoints Saved');
    this.rootApp.storage.set('wallet', this.rootApp.wallet);
    this.rootApp.storage.set('daemon', this.rootApp.daemon);
    this.rootApp.storage.set('wallet_address', this.rootApp.wallet_address);
  }

}
