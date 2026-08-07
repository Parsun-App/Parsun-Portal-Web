# Portal Auth — Test Sprite E2E Plan

## Coverage Matrix

| ID | Description | Severity | Status |
|----|-------------|----------|--------|
| PAUTH-001 | Login exitoso con RIF y password válidos | CRITICAL | 🔲 NOT EXECUTED |
| PAUTH-002 | Login fallido con password incorrecta | CRITICAL | 🔲 NOT EXECUTED |
| PAUTH-003 | Login fallido con RIF inexistente | HIGH | 🔲 NOT EXECUTED |
| PAUTH-004 | Login fallido con portal_access deshabilitado | HIGH | 🔲 NOT EXECUTED |
| PAUTH-005 | Validación de formulario vacío | MEDIUM | 🔲 NOT EXECUTED |
| PAUTH-006 | Persistencia de sesión al recargar página | HIGH | 🔲 NOT EXECUTED |
| PAUTH-007 | Logout exitoso — limpia tokens y redirige | CRITICAL | 🔲 NOT EXECUTED |
| PAUTH-008 | Protección de rutas sin autenticación | CRITICAL | 🔲 NOT EXECUTED |
| PAUTH-009 | Redirección a login desde ruta protegida | HIGH | 🔲 NOT EXECUTED |
| PAUTH-010 | Cambio de contraseña exitoso | CRITICAL | 🔲 NOT EXECUTED |
| PAUTH-011 | Cambio de contraseña — contraseña actual incorrecta | HIGH | 🔲 NOT EXECUTED |
| PAUTH-012 | Cambio de contraseña — nueva contraseña débil | MEDIUM | 🔲 NOT EXECUTED |
| PAUTH-013 | Cambio de contraseña — confirmación no coincide | MEDIUM | 🔲 NOT EXECUTED |
| PAUTH-014 | Refresh automático de token (simular expiración) | HIGH | 🔲 NOT EXECUTED |
| PAUTH-015 | Verificar tokens en localStorage | MEDIUM | 🔲 NOT EXECUTED |
| PAUTH-016 | Login con formato RIF inválido | LOW | 🔲 NOT EXECUTED |
| PAUTH-017 | Error 401 con token inválido/manipulado | HIGH | 🔲 NOT EXECUTED |

---

## Pre-requisites

- Parsun API corriendo en `http://localhost:8080`
- Portal web corriendo en `http://localhost:4200`
- Customer seed con `portal_access = true`

### Customer de prueba
| RIF | Password |
|-----|----------|
| `J-12345678-9` | `Customer1.` |

### Dependencias de tests

| Test | Depende de |
|------|------------|
| PAUTH-007 | PAUTH-001 (debe estar logueado) |
| PAUTH-010 | PAUTH-001 (debe estar logueado) |
| PAUTH-014 | PAUTH-001 (necesita tokens válidos) |
| PAUTH-017 | PAUTH-001 + manipulación manual |

---

## Casos de Prueba

### PAUTH-001 — Login exitoso con RIF y password válidos
- **Severity**: CRITICAL
- **Dependencies**: Ninguna
- **Prerequisites**: Customer `J-12345678-9` con portal_access=true y password=`Customer1.`
- **URL**: `http://localhost:4200/auth/login`

**Given** un customer con portal access habilitado
**When** ingresa RIF `J-12345678-9` y password `Customer1.` y hace clic en "Iniciar sesión"
**Then** es redirigido a `/dashboard`
**And** localStorage contiene `accessToken`, `refreshToken`, `customer`
**And** el token es un JWT válido decodificable

- **Result**: 🔲 NOT EXECUTED
- **Evidence**: `../reports/screenshots/PAUTH-001-login-exitoso.png`

---

### PAUTH-002 — Login fallido con password incorrecta
- **Severity**: CRITICAL
- **Dependencies**: Ninguna
- **URL**: `http://localhost:4200/auth/login`

**Given** un customer con RIF `J-12345678-9`
**When** ingresa password incorrecta `WrongPass.1` y hace clic en "Iniciar sesión"
**Then** se muestra mensaje de error "Invalid RIF or password"
**And** NO es redirigido al dashboard
**And** localStorage NO contiene tokens

- **Result**: 🔲 NOT EXECUTED
- **Evidence**: `../reports/screenshots/PAUTH-002-login-fallido.png`

---

### PAUTH-003 — Login fallido con RIF inexistente
- **Severity**: HIGH
- **Dependencies**: Ninguna
- **URL**: `http://localhost:4200/auth/login`

**Given** un RIF que no existe en el sistema `Z-00000000-0`
**When** intenta hacer login con cualquier password
**Then** se muestra mensaje de error "Invalid RIF or password"
**And** NO se crean tokens

- **Result**: 🔲 NOT EXECUTED

---

### PAUTH-004 — Login fallido con portal_access deshabilitado
- **Severity**: HIGH
- **Dependencies**: Customer con portal_access=false (requiere setup manual o seed específico)
- **URL**: `http://localhost:4200/auth/login`

**Given** un customer con portal_access=false
**When** intenta hacer login con credenciales correctas
**Then** se muestra mensaje de error indicando que la cuenta no tiene acceso al portal
**And** NO es redirigido al dashboard

- **Result**: 🔲 NOT EXECUTED

---

### PAUTH-005 — Validación de formulario vacío
- **Severity**: MEDIUM
- **Dependencies**: Ninguna
- **URL**: `http://localhost:4200/auth/login`

**Given** el formulario de login está vacío
**When** hace clic en "Iniciar sesión"
**Then** el botón está deshabilitado (campos required)
**And** NO se envía request al backend

- **Result**: 🔲 NOT EXECUTED

---

### PAUTH-006 — Persistencia de sesión al recargar página
- **Severity**: HIGH
- **Dependencies**: PAUTH-001 (debe estar logueado primero)
- **URL**: `http://localhost:4200/dashboard`

**Given** un customer autenticado en `/dashboard`
**When** recarga la página (F5)
**Then** sigue en `/dashboard` (no es redirigido a login)
**And** los tokens en localStorage se mantienen
**And** el AuthService restaura la sesión desde localStorage

- **Result**: 🔲 NOT EXECUTED

---

### PAUTH-007 — Logout exitoso
- **Severity**: CRITICAL
- **Dependencies**: PAUTH-001
- **URL**: Cualquier página autenticada

**Given** un customer autenticado
**When** ejecuta logout (llamar a authService.logout() desde consola o desde un botón si existe)
**Then** es redirigido a `/auth/login`
**And** localStorage NO contiene `accessToken`, `refreshToken`, `customer`
**And** el refresh token es revocado en el backend (POST /api/portal/auth/logout)

- **Result**: 🔲 NOT EXECUTED

---

### PAUTH-008 — Protección de rutas sin autenticación
- **Severity**: CRITICAL
- **Dependencies**: Ninguna
- **URL**: `http://localhost:4200/dashboard`

**Given** NO hay tokens en localStorage
**When** navega directamente a `/dashboard`
**Then** es redirigido a `/auth/login`
**And** la URL del browser muestra `/auth/login`

- **Result**: 🔲 NOT EXECUTED

---

### PAUTH-009 — Redirección a login desde ruta protegida
- **Severity**: HIGH
- **Dependencies**: Ninguna
- **URL**: `http://localhost:4200/products`

**Given** NO está autenticado
**When** navega a `/products`
**Then** es redirigido a `/auth/login`

- **Result**: 🔲 NOT EXECUTED

---

### PAUTH-010 — Cambio de contraseña exitoso
- **Severity**: CRITICAL
- **Dependencies**: PAUTH-001
- **URL**: `http://localhost:4200/auth/change-password`

**Given** un customer autenticado con password `Customer1.`
**When** navega a `/auth/change-password`
**And** ingresa currentPassword=`Customer1.`, newPassword=`NewPass.2`, confirmPassword=`NewPass.2`
**And** hace clic en "Cambiar contraseña"
**Then** se muestra mensaje de éxito "Contraseña actualizada correctamente"
**And** puede hacer login con la nueva contraseña `NewPass.2`
**And** NO puede hacer login con la contraseña antigua `Customer1.`

- **Result**: 🔲 NOT EXECUTED
- **Evidence**: `../reports/screenshots/PAUTH-010-cambio-password-exitoso.png`

---

### PAUTH-011 — Cambio de contraseña — contraseña actual incorrecta
- **Severity**: HIGH
- **Dependencies**: PAUTH-001
- **URL**: `http://localhost:4200/auth/change-password`

**Given** un customer autenticado
**When** ingresa currentPassword incorrecta
**Then** se muestra error "Current password is incorrect"
**And** la contraseña NO cambia

- **Result**: 🔲 NOT EXECUTED

---

### PAUTH-012 — Cambio de contraseña — nueva contraseña débil
- **Severity**: MEDIUM
- **Dependencies**: PAUTH-001
- **URL**: `http://localhost:4200/auth/change-password`

**Given** un customer autenticado
**When** ingresa newPassword=`short` (menos de 8 caracteres, sin mayúscula, sin especial)
**Then** el formulario muestra errores de validación
**And** el botón "Cambiar contraseña" está deshabilitado

- **Result**: 🔲 NOT EXECUTED

---

### PAUTH-013 — Cambio de contraseña — confirmación no coincide
- **Severity**: MEDIUM
- **Dependencies**: PAUTH-001
- **URL**: `http://localhost:4200/auth/change-password`

**Given** un customer autenticado
**When** ingresa newPassword y confirmPassword diferentes
**Then** se muestra error "Las contraseñas no coinciden"
**And** el botón está deshabilitado

- **Result**: 🔲 NOT EXECUTED

---

### PAUTH-014 — Refresh automático de token
- **Severity**: HIGH
- **Dependencies**: PAUTH-001
- **URL**: `http://localhost:4200/dashboard`

**Given** un customer autenticado
**When** el access token expira (esperar 15 min o manipular token manualmente)
**And** se hace una request a un endpoint protegido
**Then** el interceptor detecta el 401
**And** automáticamente hace refresh del token
**And** reintenta la request original con el nuevo token
**And** la respuesta es exitosa
**And** localStorage tiene los nuevos tokens

- **Result**: 🔲 NOT EXECUTED

---

### PAUTH-015 — Verificar tokens en localStorage
- **Severity**: MEDIUM
- **Dependencies**: PAUTH-001
- **URL**: `http://localhost:4200/dashboard`

**Given** un customer autenticado
**When** se inspecciona localStorage
**Then** existe `accessToken` (string JWT no vacío)
**And** existe `refreshToken` (string UUID no vacío)
**And** existe `customer` (JSON con id, legalName, rif)
**And** el accessToken decodificado contiene `sub`, `type: "CUSTOMER"`, `exp`

- **Result**: 🔲 NOT EXECUTED

---

### PAUTH-016 — Login con formato RIF inválido
- **Severity**: LOW
- **Dependencies**: Ninguna
- **URL**: `http://localhost:4200/auth/login`

**Given** el formulario de login
**When** ingresa RIF con formato inválido `abc`
**Then** el backend devuelve error "Invalid RIF format"

- **Result**: 🔲 NOT EXECUTED

---

### PAUTH-017 — Error 401 con token inválido/manipulado
- **Severity**: HIGH
- **Dependencies**: Manipular token manualmente
- **URL**: `http://localhost:4200/dashboard`

**Given** un customer autenticado
**When** se modifica manualmente el accessToken en localStorage (caracteres aleatorios)
**And** se intenta acceder a un endpoint protegido
**Then** el backend devuelve 401
**And** el interceptor intenta refresh (que falla porque el refresh token es válido pero el access no)
**Then** el usuario es redirigido a `/auth/login`

- **Result**: 🔲 NOT EXECUTED

---

## Execution Results

| Executed | Passed | Failed | Warning | Pending |
|----------|--------|--------|---------|---------|
| 0 | 0 | 0 | 0 | 17 |

---

## Bugs Found

| ID | Test | Severity | Description |
|----|------|----------|-------------|
| — | — | — | — |

---

## Session Notes

- Fecha: —
- Entorno: —
- Navegador: —
- Duración: —
