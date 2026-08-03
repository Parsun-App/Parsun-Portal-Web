import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PortalProduct } from '@features/products/models';
import type { PagedResponse } from '@shared/models';

@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/portal/products`;

  list(search?: string, categoryId?: string, page: number = 0, size: number = 20): Observable<PagedResponse<PortalProduct>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    if (categoryId) params = params.set('categoryId', categoryId);
    return this.http.get<PagedResponse<PortalProduct>>(this.baseUrl, { params });
  }
}
