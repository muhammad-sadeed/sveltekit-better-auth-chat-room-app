# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
bun x sv@1.1.1 create --template minimal --types ts --add prettier eslint tailwindcss="plugins:none" enhanced-img experimental="features:async,remoteFunctions" sveltekit-adapter="adapter:vercel" --install bun sv-better-auth
```

## Adding features

Add features to your project with `sv add`:

```sh
npx sv add
```

For example, to add Tailwind CSS:

```sh
npx sv add tailwindcss
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

## Desktop app (Electron)

The desktop app is a thin Electron shell that loads the deployed web app directly — the hosted Vercel deployment is the backend, so all `/api/auth`, remote-function and OAuth traffic hits it and **no secrets are bundled into the desktop app**.

```sh
# develop with HMR (vite dev + Electron window against the local backend)
bun run electron:dev

# run the desktop app (loads the deployed app)
bun run electron:start

# package a macOS .dmg into dist-electron/
bun run electron:dist
```

The loaded URL defaults to `https://sveltekit-better-auth-chat-room-app.vercel.app` and can be overridden with the `DESKTOP_APP_URL` environment variable.

### Packaging

```sh
bun run electron:dist        # macOS .dmg
bun run electron:dist:win    # Windows: NSIS Setup.exe + portable .exe (x64, cross-built from macOS)
bun run electron:dist:all    # both platforms
```

Artifacts land in `dist-electron/`. The app icon is generated from `src/lib/assets/favicon.svg` by `bun run icon` into `electron/build/icon.png`.

### CI (Windows exe)

`.github/workflows/build-windows.yml` builds the Windows exes on a real Windows runner on every `v*` tag (or manual dispatch) and uploads them as artifacts — the most reliable way to produce Windows builds.

The packaged apps are unsigned unless you configure code signing (see [electron-builder docs](https://www.electron.build/code-signing)); expect a SmartScreen warning on Windows and a Gatekeeper notice on macOS.
