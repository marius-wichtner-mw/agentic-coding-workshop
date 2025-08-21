## R1: User Management

### Context
Establish the foundation for accounts using username-only identities, simple authentication, and basic profile management suitable for an MVP.

### Goals
- Provide `/api/users` for listing and creating users with validation.
- Provide basic auth endpoints: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me` with cookie sessions.
- Ship minimal UI for registration, login, and profile display.

### Planned (original)
- Username-only accounts with validation rules.
- Create user via POST `/api/users`.
- Read users via GET `/api/users`.
- Session-based login/logout and current user endpoint.
- Client UI for registration and login.

### Done
- Implemented `/api/users` GET and POST with validation and unique constraint handling.
- Implemented auth endpoints: `login`, `logout`, `me` using cookie-backed sessions.
- Added Swagger docs for users and global spec page.
- Created React components: `UserRegistration`, `UserLogin`, `UserProfile` and `/auth` page shell.
- Added comprehensive unit tests for `@users` and `@auth` API routes (100% coverage).

### In Progress / Next
- Add user update endpoint (rename username) and corresponding UI.
- Persist and render authenticated state on the client (e.g., fetch `/api/auth/me`).

### Improvements
- Strengthen server-side input sanitization and consistent error codes/messages.
- Rate limit login attempts; add basic anti-abuse.
- Add stricter username validation and availability check on frontend.
- Add e2e tests for the auth flow and user creation via UI.

### Future Features
- OAuth/third-party login providers.
- Password-based accounts or passkeys (beyond MVP scope).
- Profile avatars and basic settings page.

### API Summary
- `GET /api/users` → list users, returns `{ users, total }`.
- `POST /api/users` → create user, returns `{ message, user }` or 400/409.
- `POST /api/auth/login` → create session for existing username.
- `POST /api/auth/logout` → destroy current session.
- `GET /api/auth/me` → returns current user from session or 401.
