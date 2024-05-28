/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { LibraryConfigurationService } from '@blueprint/service/library-configuration/library-configuration.service';
import { AuthService } from '@blueprint/service/auth/auth.service';

/**
 * An HTTP interceptor that adds basic auth credentials to requests to the library configuration service.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly libraryConfig = inject(LibraryConfigurationService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /**
   * Intercepts HTTP requests and adds basic auth credentials to requests to the library configuration service.
   * @param req The HTTP request.
   * @param next The HTTP handler.
   * @returns An observable of the HTTP event.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // If the request is for the sparql endpoint, add the basic auth credentials.
    if (req.url.includes(this.libraryConfig.endpointUrl)) {
      // Create the authorization header by base64-encoding the username and password separated by a colon.
      const credentials = this.authService.getCredentials();

      const authHeader = `Basic ${btoa(`${credentials ? credentials.username : ''}:${credentials ? credentials.password : ''}`)}`;

      // Clone the original request and add the authorization header to the headers.
      const authReq = req.clone({
        headers: req.headers.set('Authorization', authHeader)
      });

      // Pass the modified request to the next handler in the chain.
      return next.handle(authReq).pipe(
        catchError(error => {
          // If the response returns an HTTP 401 status code (Unauthorized), navigate to the login page.
          if (error.status === 401) {
            this.router.navigate(['/login']);
          }
          // Rethrow the error.
          return throwError(() => new Error(error.message))
        })
      );
    } else {
      // If the request is not for the library configuration service, pass the original request to the next handler in the chain.
      return next.handle(req);
    }
  }
}