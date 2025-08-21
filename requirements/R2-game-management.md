## R2: Game Management

### Context
Enable users to create and browse games, including metadata and image upload.

### Goals
- CRUD API for games at `/api/games`.
- Image upload endpoint `/api/games/upload` storing files under `/public/uploads`.
- UI to create, list, and search games.

### Planned
- Simple `Game` model with `name`, `type`, `image_url`, `created_by`.
- Server-side validation and error handling.
- Swagger documentation and example payloads.

### Status
- Pending implementation.

### Future Considerations
- Pagination and search filters.
- Ownership checks and moderation.
