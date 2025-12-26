import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { animations } from '../../app/animation';
import { UserService } from '../../utilities/services/user.service';
import { Observable, of } from 'rxjs';
import { User } from 'firebase/auth';
import { AuthFormComponent } from "../../app/components/auth-form/auth-form.component";
import { ChatComponent } from "../../app/chat/chat.component";
import { ResetPasswordFormComponent } from '../../app/components/reset-password-form/reset-password-form.component';

const MODE_PARAMETER = 'mode';
const OOBCODE_PARAMETER = 'oobCode';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, AuthFormComponent, ChatComponent, ResetPasswordFormComponent],
  templateUrl: './topbar.component.html',
  animations: animations,
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements  OnInit {

  public currentUser: Observable<User | null> = of(null);

  public formVisibility : boolean = false;

  public chatVisibility : boolean = false;

  public resetPasswordVisibility : boolean = false;

  public modeParam: string | null = null;

  public oobCodeParam: string | null = null;

  constructor(
    public router: Router,
    public userService : UserService,
    private route: ActivatedRoute
  ) {}
    
  ngOnInit(): void { 
    this.currentUser = this.userService.currentUser$;

    this.route.queryParams.subscribe(params => {
      this.modeParam = params[MODE_PARAMETER];
      this.oobCodeParam = params[OOBCODE_PARAMETER];
    
      if (this.modeParam === 'resetPassword' && this.oobCodeParam) {
        this.resetPasswordVisibility = true;
      }
    });
  }

  public isCurrentPage(page : string): boolean {
    return this.router.url === page;
  }

  public goTo(path: string) {
    this.router.navigateByUrl(path)
  }

  public formVisibilityCallBack() : void {
    this.formVisibility = false;
  }

  public chatVisibilityCallBack() : void {
    this.chatVisibility = false;
  }

  public resetPasswordVisibilityCallBack() : void {
    this.resetPasswordVisibility = false;
    this.cleanUrl();
  }

  private cleanUrl(): void {
    this.router.navigate([], {
      queryParams: {},
      replaceUrl: false
    });
  }

  public closeList() : void {
    const popover = document.getElementById("openList");
    
    if (popover) {
      popover.hidePopover()
    }
  }

  public checkCurrentPage() : void {
    if (this.isCurrentPage('/admin') || this.isCurrentPage('/profile')) {
      this.goTo("/")
    }
  }
}
