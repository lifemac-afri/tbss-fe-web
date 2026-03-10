# Contributing to TBSS Frontend Web

## Version Control and Branching

We strictly enforce **SOP-VC-001**. Please ensure you are familiar with its contents before contributing.

### Key Rules
- Create feature branches from `develop`: `feature/[TICKET-ID]-brief-description`
- Do not commit secrets. Use `.env.example` to document environment variables.
- PRs must pass CI checks and receive 1 approval before merging to `develop`.
- PRs targeting `main` require 2 approvals (including the Engineering Lead).
- Commit messages must follow Conventional Commits (e.g., `feat(api): add endpoint`).

### PR Checklist
Please verify the following before requesting a review:
- Local tests pass
- ESLint and Prettier formatting checks pass
- No debug statements `console.log()` remain
- PR description is fully populated with "What", "Why", "How to Test", and Screenshots.
