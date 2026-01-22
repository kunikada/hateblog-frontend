# Working Rules

To prevent rework and avoid increased workload, follow these rules when working:
All responses must be in Japanese

## Documentation

- Keep content to the minimum necessary
- Keep each file between 200-400 lines, with a maximum of 500 lines
- Confirm in advance if you determine that examples or case studies need to be included
- Separate summary documents from example/case study files
- Verify that the target file is correct and not duplicated

## Implementation

- Confirm in advance and obtain consent when doing something different from instructions
- Confirm in advance and obtain consent when changing settings or policies
- Stop and confirm in advance if other issues are found during work
- Always delete temporary files created during work
- When adding debug messages, output them at debug level
- Structure directories and files based on functionality and domain, not data or types
- After implementation, do not run commands like format/lint/test; report instead

## Terminal

- Confirm in advance when killing processes

# Architecture

- **`Runtime`**: TypeScript / pnpm
- **`Build`**: Vite v7
- **`UI`**: React v19 / Tailwind CSS v4 / shadcn/ui
- **`Infrastructure`**: TanStack Router / TanStack Query
- **`API`**: openapi-typescript
- **`Testing`**: Vitest / Biome / MSW

# Directory Structure

- **`.devcontainer/`**: Development environment definition for DevContainer (Docker + VS Code)
- **`docs/`**: Location for design documents such as architecture and specifications
- **`public/`**: Static files served as-is during build
- **`src/api/`**: API client definition and communication layer using OpenAPI types
- **`src/usecases/`**: Application operation procedures called from screens (business logic and side-effect orchestration)
- **`src/components/layout/`**: Common screen layouts such as headers and footers
- **`src/components/page/`**: Page-specific components used at the route level
- **`src/components/ui/`**: Reusable UI components
- **`src/hooks/`**: React glue layer (TanStack Query subscriptions, form/URL state, UI convenience wrappers)
- **`src/infra/repositories/`**: Concrete Repository implementations (layer dependent on HTTP/OpenAPI client and cache control)
- **`src/lib/`**: Framework-independent common utilities
- **`src/mocks/`**: API mock definitions for MSW
- **`src/repositories/`**: Repository interface/type definitions (boundaries that usecases depend on)
- **`src/routes/`**: TanStack Router route definitions
- **`src/index.css`**: Tailwind CSS v4 entry CSS
- **`src/main.tsx`**: React application entry point
- **`biome.json`**: Biome lint and format configuration
- **`components.json`**: shadcn/ui component generation configuration
- **`index.html`**: Vite HTML entry file
- **`oepnapi.yaml`**: OpenAPI definition for API specification (source for type generation)
- **`package.json`**: Dependency and script definitions
- **`tsconfig.json`**: TypeScript configuration for frontend
- **`tsconfig.node.json`**: TypeScript configuration for Node.js (Vite/tests)
- **`vite.config.ts`**: Vite build and development server configuration
- **`vitest.config.ts`**: Vitest test configuration
