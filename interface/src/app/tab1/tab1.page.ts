import { Component } from '@angular/core';
import { AppComponent, AgentStatus, AgentStatusColors } from '../app.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor(public rootApp: AppComponent) {
    console.log(AgentStatus[this.rootApp.wallet_status]);
    console.log(AgentStatus[this.rootApp.daemon_status]);
  }

}
