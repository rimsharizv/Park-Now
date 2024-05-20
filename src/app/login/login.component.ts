import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { UserInformation } from '../interfaces/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  userInfo : UserInformation;
  loginFailed : boolean = false;
  email : any;
  password : any;
  constructor(private router : Router, private userService : UserService){
    this.userInfo = {name : "", password : "", email : ""}
  }

  onSubmit(){
    this.populateLoginInfo()
  }

  populateLoginInfo(){
    this.email = (document.getElementById("email") as HTMLInputElement).value;
    this.password = (document.getElementById("password") as HTMLInputElement).value;
    this.verifyUser()
  }

  verifyUser() {
    this.userService.getUserByEmail(this.email).subscribe(users => {
      if (users.length > 0 && users[0].password === this.password) {
        this.loginFailed = false
        this.userService.setUserInfo(users[0])
        this.navigatePage('')
      } else {
        this.loginFailed = true;
        console.log("Invalid email or password");
      }
    });
  }
  
  navigatePage(path : string){
    this.router.navigateByUrl(path)
  }
}
