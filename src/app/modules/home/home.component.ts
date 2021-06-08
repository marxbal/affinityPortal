import { Component, OnInit, HostListener } from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import {AuthenticationService} from '../../services/authentication.service';
import {Router} from '@angular/router';
import {ComponentCanDeactivate} from '../../guard/component-can-deactivate';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, ComponentCanDeactivate  {

  constructor(private auth: AuthenticationService,private router: Router) { }

  isDirty: boolean = false;
  @HostListener('window:beforeunload')
  canDeactivate(): boolean {
    return !this.isDirty;
  }

  ngOnInit() {

      

  }


}
