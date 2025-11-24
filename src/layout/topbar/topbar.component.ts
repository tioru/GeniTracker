import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { animations } from '../../app/animation';
import { AuthService } from '../../utilities/services/auth.service';
import { Observable, of } from 'rxjs';
import { User } from 'firebase/auth';
import { AuthFormComponent } from "../../app/components/auth-form/auth-form.component";

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, AuthFormComponent],
  templateUrl: './topbar.component.html',
  animations: animations,
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {

  public currentUser: Observable<User | null> = of(null);

  public formVisibility : boolean = false;

  constructor(
    public router: Router,
    public authService : AuthService
  ) {}
    
  ngOnInit(): void { 
    this.currentUser = this.authService.currentUser$;
  }

  public get isHome(): boolean {
    return this.router.url === '/';
  }

  public goTo(path: string) {
    this.router.navigateByUrl(path)
  }

  public formVisibilityCallBack() : void {
    this.formVisibility = false;
  }

  public closeList() : void {
    const popover = document.getElementById("openList");
    
    if (popover) {
      popover.hidePopover()
    }
  }
}
