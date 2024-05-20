import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserInformation } from '../interfaces/user';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  userInfo : UserInformation;
  nameError : boolean = true;
  emailError : boolean = true;
  passwordError : boolean = true;
  email? : string;


  constructor(private router : Router, private userService : UserService){
    this.userInfo = {name : "", email : "", password : ""}
  }

  onSubmit(){
    if(this.errorChecking()){
      this.populateUserDetails();
      this.userService.storeUserInfo(this.userInfo)
      this.userService.setUserInfo(this.userInfo)
      this.navigatePage('')
    }
  }

  errorCheckName() : boolean{
    let name = (document.getElementById("fullname") as HTMLInputElement).value;
    for(let i = 0; i<name.length; i++){
      if(name[i] == ' '){
        return true;
      }
    }
    return false;
  }

  errorCheckEmail() : boolean{
    this.email = (document.getElementById("email") as HTMLInputElement).value;
    for(let i = 0; i<this.email.length; i++){
      if(this.email[i] == '@'){
        for(let j = i; j<this.email.length; j++){
          if(this.email[j] == '.'){
            return true;
          }
        }
      }
    }
    return false;
  }

  errorCheckPassword() : boolean{
    let password = (document.getElementById("password") as HTMLInputElement).value;
    let confirmPassword = (document.getElementById("cpassword") as HTMLInputElement).value;
    if(password != confirmPassword || password.length == 0){
      return false;
    }
    return true;
  }

  errorChecking() : boolean{
    this.nameError = this.errorCheckName();
    this.emailError = this.errorCheckEmail();
    this.passwordError = this.errorCheckPassword();

    if(this.nameError && this.emailError && this.passwordError){
      return true;
    }
    return false;
  }

  populateUserDetails(){
    this.userInfo.name = (document.getElementById("fullname") as HTMLInputElement).value;
    this.userInfo.email = (document.getElementById("email") as HTMLInputElement).value;
    this.userInfo.password = (document.getElementById("password") as HTMLInputElement).value;
  }

  navigatePage(path : string){
    this.router.navigateByUrl(path)
  }
}
