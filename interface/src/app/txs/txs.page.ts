import { Component, OnInit } from '@angular/core';
import { AppComponent, AgentStatus, AgentStatusColors } from '../app.component';

@Component({
  selector: 'app-txs',
  templateUrl: './txs.page.html',
  styleUrls: ['./txs.page.scss'],
})
export class TxsPage implements OnInit {

  constructor(
    public rootApp: AppComponent,
  ) { }

  ngOnInit() {
    this.rootApp.reloadTXs();
  }

}
