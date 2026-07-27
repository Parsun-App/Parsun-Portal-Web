import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PortalProfile } from '@shared/models';

@Injectable({ providedIn: 'root' })
export class ProfileApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/portal/profile`;

  getProfile(): Observable<PortalProfile> {
    return this.http.get<PortalProfile>(this.baseUrl);
  }
}
