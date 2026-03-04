# Astro Starter Kit: Minimal

```sh
pnpm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `pnpm install`         | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Folder Structure

```
/src
  ├── /shared
  │   └── /locales             # GLOBAL NAMESPACES
  │       ├── common.json      # "Save", "Cancel", "Back"
  │       └── validation.json  # "Field required", "Invalid email"
  │
  ├── /modules
  │   ├── /cart
  │   │   ├── /components
  │   │   ├── /context
  │   │   └── /locales         # MODULE NAMESPACE
  │   │       ├── de.json      # Keys: "subtotal", "checkout_btn", "empty_cart"
  │   │       └── en.json
  │   │
  │   └── /user-profile
  │       └── /locales
  │           ├── de.json      # Keys: "change_password", "bio"
  │           └── en.json
```

## Create a new module

```
pnpm create:module <module_name>
```
