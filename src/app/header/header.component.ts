import { Component, OnDestroy, OnInit } from "@angular/core";
import { AuthService } from "../auth/auth.service";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy{
  private authListenerSub: Subscription;
  isAuthed = false;

  constructor(private authService: AuthService){}

  ngOnInit(): void {
    this.isAuthed = this.authService.getIsAuthed()
    this.authListenerSub = this.authService.getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.isAuthed = isAuthenticated
      })
  }

  onLogout(){
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.authListenerSub.unsubscribe()
  }

}
