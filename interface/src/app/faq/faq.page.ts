import { Component, OnInit } from '@angular/core';
import { AppComponent, AgentStatus, AgentStatusColors } from '../app.component';
import { NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.page.html',
  styleUrls: ['./faq.page.scss'],
})
export class FaqPage implements OnInit {

  constructor(
    public rootApp: AppComponent,
    public router: Router
  ) {

  }

  ngOnInit() {
  }

}
