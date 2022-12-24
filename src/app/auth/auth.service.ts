import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { AuthData } from "./auth-data.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService{
  private token: string;
  private authStatusListener = new Subject<boolean>()
  private isAuthed = false;
  private tokenTimer: any;
  private userId: string;

  constructor(private http: HttpClient, private router: Router){}

  getToken(){
    return this.token;
  }

  getIsAuthed(){
    return this.isAuthed;
  }

  getAuthStatusListener(){
    return this.authStatusListener.asObservable();
  }

  getUserId(){
    return this.userId;
  }

  createUser(email: string, password: string){
    const authData: AuthData = {
      email: email,
      password: password
    }
    return this.http.post("http://localhost:3000/api/user/signup", authData)
      .subscribe(() => {
        this.router.navigate(['/'])
      }, error => {
        this.authStatusListener.next(false)
      })
  }

  login(email: string, password: string){
    const authData: AuthData = {
      email: email,
      password: password
    }
    this.http.post<{token: string, expiresIn: number, userId: string}>("http://localhost:3000/api/user/login", authData)
      .subscribe(res => {
        const token = res.token;
        this.token = token;
        if(token){
          const expiresInDuration = res.expiresIn;
          this.setAuthTimer(expiresInDuration)
          this.isAuthed = true;
          this.userId = res.userId;
          this.authStatusListener.next(true);
          const now = new Date();    //current time
          const expirationDate = new Date( now.getTime() + expiresInDuration * 1000)
          this.saveAuthData(token, expirationDate, this.userId)
          console.log(expirationDate)
          this.router.navigate(['/'])
        }
      }, error => {
        this.authStatusListener.next(false)
      })
  }

  autoAuthUser(){
    const authInfo = this.getAuthData()
    if(!authInfo){
      return
    }
    const now = new Date();
    const expiresIn = authInfo.expirationDate.getTime() - now.getTime();
    if(expiresIn > 0){
      this.token = authInfo.token;
      this.isAuthed = true;
      this.userId = authInfo.userId
      this.setAuthTimer(expiresIn / 1000)
      this.authStatusListener.next(true)
    }
  }

  logout(){
    this.token = null;
    this.isAuthed = false;
    this.authStatusListener.next(false);
    this.router.navigate(['/']);
    clearTimeout(this.tokenTimer);
    this.clearAuthData()
    this.userId = null;
  }

  private setAuthTimer(duration: number){
    console.log("Setting timer: "+duration)
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000)
  }

  private saveAuthData(token: string, expDate: Date, userId: string){
    localStorage.setItem('token', token)
    localStorage.setItem('expiration', expDate.toISOString())
    localStorage.setItem("userId", userId)
  }

  private clearAuthData(){
    localStorage.removeItem("token")
    localStorage.removeItem("expiration")
    localStorage.removeItem("userId")
  }

  private getAuthData(){
    const token = localStorage.getItem("token")
    const expDate = localStorage.getItem("expiration")
    const userId = localStorage.getItem("userId")
    if(!token || !expDate){
      return null
    }
    return {
      token: token,
      expirationDate: new Date(expDate),
      userId: userId
    }

  }

}
