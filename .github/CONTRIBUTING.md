# Contributing

Thanks for your interest in contributing! Here's how to get started.

## Getting Started

1. Fork the repository and clone your fork.
2. Follow the [Quick Start](../README.md#-quick-start) instructions in the README.
3. Create a feature branch: `git checkout -b my-feature`
4. Make your changes, commit, and open a pull request against `main`.

## Good First Issues

These are well-scoped improvements that don't require deep knowledge of the codebase:

| # | Idea | Relevant file(s) |
|---|---|---|
| 1 | **Keyboard fallback** — map `WASD` keys to POST `/move_object` so the demo works without a physical controller | `frontend/src/index.ts` |
| 2 | **Swap vehicle model** — add a model-picker dropdown in the sidebar to choose between multiple GLTF files | `frontend/src/index.ts`, `frontend/public/index.html` |
| 3 | **Path recording** — log `{x, y, z, timestamp}` on the server and expose `/playback` to replay a recorded path | `app.py` |
| 4 | **Speed indicator** — compute distance between position updates and display a speed value in the HUD | `frontend/src/index.ts` |
| 5 | **Mobile gamepad API** — read controller axes in the browser via the [Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API) instead of the Python script | `frontend/src/index.ts` |
| 6 | **Docker one-command demo** — create a `Dockerfile` for the Flask server and a `docker-compose.yml` | new files |
| 7 | **Unit tests** — add `pytest` tests for the Flask endpoints (`/move_object`, `/get_position`) | new `tests/` folder |

## Code Style

- **Python**: follow [PEP 8](https://peps.python.org/pep-0008/). Run `flake8 .` before committing.
- **TypeScript**: the project uses strict TypeScript (`"strict": true` in `tsconfig.json`). Run `npm run build` to check for type errors.

## Submitting a Pull Request

- Keep PRs focused on a single change.
- Update the README if your change adds or removes a user-visible feature.
- Add or update comments where the logic isn't obvious.

## Reporting Bugs

Open an issue with:
- Steps to reproduce
- Expected vs actual behaviour
- OS, Python version, Node.js version, and browser
