# @nutsloop/ivy-server

**Facilitating & Enhancing Network Strength**

> ⚠ **Alpha Warning**: This project is in early development. Expect breaking changes, bugs, and a little chaos. We document with love, but things may shift quickly.

---

## Description

#### What is Ivy Server?

`@nutsloop/ivy-server` is a modern, powerful, TypeScript-powered command-line server. With a rust-native file watcher at its core, it enhances developer workflows with features like:

- ⚙️ Live browser reloading on file changes (powered by Rust) for instant feedback and seamless development
- 🛰️ Static and dynamic content serving
- 🔁 Built-in route support
- 🧪 Zero-config developer experience
- 🧩 Extensive CLI customisation through flags
- 🛠️ Experimental `control room` for remote management, audit via secure sockets (work in progress)
- 🌐 Multi-domain support — Serve content across multiple domains with ease!

Common uses include:

 - ⚡️ Local development servers for fast feedback loops
 - 🌐 Lightweight APIs and microservices
 - 🧪 Experimental workflows and prototyping

---

## Requirements

- Supported Operating Systems:
  - **Linux** (tested on Fedora and Oracle Linux)
  - **macOS**
  - ⚠ **Windows** is not supported

- Software dependencies:
  - [Rust](https://www.rust-lang.org/tools/install) >= 1.55.0
  - [Node.js](https://nodejs.org/) >= 20.0.0

---

## Quick Start

### 📦 Installation

Install via npm:

> **Important**:  
> `@nutsloop/ivy-server` runs **only on Unix-like systems** (macOS, Linux). Windows is currently **not supported**.  
> It also requires **Node.js v20 or higher**.

```bash
npm install @nutsloop/ivy-server
npm pkg set type=module
```

> **Warning**:  
> `@nutsloop/ivy-server` is built **exclusively** with **ES Modules (ESM)**.  
> Your entire project — including all route handlers — **must** use ESM.  
> CommonJS (`require`, `module.exports`) is **not supported** and will cause runtime errors.

To ensure compatibility:
- Set `"type": "module"` in your `package.json`.
- Use `import` / `export` syntax only.
- Avoid `.cjs` or CommonJS-style tooling.

This strict ESM-only setup guarantees cleaner semantics and future-friendly module resolution.

---

### Create a Public Directory

Ivy serves static files from a `./public` directory by default. To get started, create the folder and add a basic `index.html`:

```bash
mkdir ./public
echo '<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ivy Server</title>
  </head>
  <body>
    <h1>Hello from Ivy</h1>
  </body>
</html>' > ./public/index.html
```

Start the server:

```bash
export PATH="$PWD/node_modules/.bin:$PATH"
ivy-server spin
```


---

## CLI Commands and Flags

Ivy Server includes powerful commands and flags for customisation.

### Core Commands

- **spin**: Start a single server instance:
  ```bash
  ivy-server spin
  ```

- **cluster**: Start multiple server instances using Node.js clusters:
  ```bash
  # this will fork for the half of the available cpus
  ivy-server cluster
  ```

- **help**: View help documentation for commands/flags:
  ```bash
  ivy-server --help
  ```

- **version**: View the current version of Ivy Server:
  ```bash
  ivy-server --version
  ```

### 🌍 Global Flags

### 🌍 Global Flags

| Flag                    | Type | Description                                                                           |
|-------------------------|------|---------------------------------------------------------------------------------------|
| `--ease`, `-e`          | void | Allows binding to ports below 1024 (note: system-level restrictions may still apply). |
| `--ease-cluster`, `-ec` | void | Removes cluster CPU limits — allows forking **any number** of workers.                |

```bash
# let’s assume the server has 8 CPUs available and system-level port restrictions have been eased.
ivy-server --ease --ease-cluster cluster --port=80 --cpus=32
```

### 🛠️ Common Flags
| Flag                            | Type       | Description                                                          |
|---------------------------------|------------|----------------------------------------------------------------------|
| `--address`, `-a`               | `string`   | Address to bind the server (default: `0.0.0.0`).                     |
| `--port`, `-p`                  | `number`   | Port to run the server on (default: `3001`).                         |
| `--https`, `-S`                 | `void\KVP` | Enable HTTPS.                                                        |
| `--log`, `-l`                   | `void`     | Enable request logging.                                              |
| `--log-color`, `-lc`            | `void`     | Colorize log output (requires `--log`).                              |
| `--log-persistent`, `-lp`       | `void`     | Persist logs to file/db (requires `logConfig.js`).                   |
| `--log-request-headers`, `-lrh` | `void`     | Log request headers (requires `--log`).                              |
| `--acme-challenge`, `-ac`       | `void`     | Serve ACME challenge files, skipping redirects/multidomain.          |
| `--control-room`, `-cr`         | `void`     | Open a socket for stats/control panel.                               |
| `--cut-user-agent`, `-cua`      | `void`     | Hide the user-agent in logs.                                         |
| `--hot-routes`, `-hr`           | `void`     | Enable hot reloading of routes.                                      |
| `--live-reload`, `-lr`          | `void/KVP` | Live reload server when files change.                                |
| `--multi-domain`, `-md`         | `string`   | Load multidomain config from file.                                   |
| `--mute-client-error`, `-mce`   | `void`     | Suppress client error logs.                                          |
| `--routes`, `-r`                | `string`   | Path to custom routes file.                                          |
| `--virtual-routes`, `-vr`       | `string`   | Declare STATUS_CODE 200 for addresses (used with `--to-index-html`). |
| `--to-index-html`, `-tih`       | `void`     | Route all requests to `index.html`.                                  |
| `--plugins`, `-P`               | `array`    | Load list of comma-separated plugins.                                |
| `--served-by`, `-sb`            | `string`   | Set a custom `served-by` HTTP header.                                |
| `--socket`, `-s`                | `void`     | Enable socket/tls connection (requires `socketConfig.js`).           |
| `--redirect-to`, `-rt`          | `string`   | Redirect requests to another URL (e.g., 301 redirects).              |
| `--redirect-to-https`, `-rth`   | `void`     | Redirect requests to HTTPS (works with `--redirect-to`).             |
| `--www-root`, `-wr`             | `string`   | Directory for static content.                                        |


### 🧠 Cluster-Specific Flags

| Flag           | Type        | Description                                                                              |
|----------------|-------------|------------------------------------------------------------------------------------------|
| `--cpus`, `-c` | number/void | Number of CPUs to utilize. If no value is provided, defaults to half the available CPUs. |
| `--exec`, `-e` | string      | Path to an entry file to execute in cluster mode.                                        |

Example usage:
```bash
ivy-server cluster --cpus=4
```

---

## Advanced Features

### Multi-Domain Support

Serve multiple domains with a configuration file:
```bash
ivy-server spin --multi-domain=path/to/config.json
```

### Plugin Support

Load plugins dynamically:
```bash
ivy-server spin --plugins=plugin1,plugin2
```

### Live Reload

Enable reload of the browser when files change (rust powered in part):
```bash
ivy-server spin --live-reload
```

---

## Development Notes

- Ivy Server is **not production-ready** yet.
- It works on **Unix-like operating systems** (Linux and macOS). Windows is unsupported.

---

## Links

- Full Documentation: [CLI Reference](./cli.md)
- Support Nutsloop’s open-source work: [GitHub Sponsors](https://github.com/sponsors/nutsloop)

---

💚 If you love Ivy Server, it loves you twice!
