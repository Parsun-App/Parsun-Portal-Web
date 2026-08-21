import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { SidebarComponent } from '@core/layouts/sidebar/sidebar.component';
import { HeaderComponent } from '@core/layouts/header/header.component';

@Component({
  selector: 'app-portal-layout',
  standalone: true,
  imports: [RouterOutlet, ToastModule, SidebarComponent, HeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './portal-layout.component.html',
})
export class PortalLayoutComponent {}
