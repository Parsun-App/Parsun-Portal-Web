# Portal Auth

Route: `/login`.

The module handles customer login, token refresh, logout, and password change. `AuthApiService` calls `/api/portal/auth/login`, `/refresh`, `/logout`, and `/change-password`.

Guards protect authenticated routes; the interceptor attaches and refreshes portal credentials. Invalid credentials are rendered as form-level errors.
