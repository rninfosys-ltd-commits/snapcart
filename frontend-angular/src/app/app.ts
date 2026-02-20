import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { SmartPopupComponent } from './shared/components/smart-popup/smart-popup.component';
import { VisitorService } from './core/services/visitor.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, SmartPopupComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend-angular');
  private router = inject(Router);
  private visitorService = inject(VisitorService);

  showLayout = signal(true);

  constructor() {
    this.visitorService.init();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;

      // Only hide navbar and footer on admin, moderator, login and signup routes
      const isHidden = url.startsWith('/admin') ||
        url.startsWith('/moderator') ||
        url.startsWith('/super-admin') ||
        url.startsWith('/login') ||
        url.startsWith('/signup');

      this.showLayout.set(!isHidden);
    });
  }
}


