.. nutsloop::ivy-server documentation master file, created by
   sphinx-quickstart on Tue Jan 21 18:17:25 2025.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

.. _ivy-server:

Ivy Server Documentation
========================

Welcome to the official documentation for ``@nutsloop/ivy-server`` — a multi-functional, TypeScript-powered CLI server with a Rust-native file watcher at its core.

.. note::

   **Alpha Warning**: This project is in early development. Expect breaking changes, bugs, and a little chaos. We document with love, but things may shift quickly.

What is Ivy Server?
-------------------

``@nutsloop/ivy-server`` is a powerful, flexible command-line server designed for modern dev workflows.

- ⚙️  Hot-reload file watching (powered by Rust)
- 🛰️  Static & dynamic content serving
- 🔁  Built-in route support
- 🧪  Zero-config developer experience
- 🧩  Extensive CLI flags for customization

Common uses include:

- Local development servers
- Static file hosting
- API
- Multi Domain server
- Experimental workflows
- A potential `control room` for remote management through secure socket connection.

Quick Start
-----------

Installation
============

Install via npm:
.. important::

   ``@nutsloop/ivy-server`` runs **only on Unix-like systems** (macOS, Linux). Windows is currently **not supported**.

   It also requires **Node.js v20 or higher**.

.. code-block:: bash

   npm install @nutsloop/ivy-server
   npm pkg set type=module

.. warning::

   ``@nutsloop/ivy-server`` is built **exclusively** with **ES Modules (ESM)**.

   Your entire project — including all route handlers — **must** use ESM.
   CommonJS (``require``, ``module.exports``) is **not supported** and will cause runtime errors.

   To ensure compatibility:

   - Set ``"type": "module"`` in your ``package.json``.
   - Use ``import`` / ``export`` syntax only.
   - Do not use ``.cjs`` or CommonJS-style tooling.

   This strict ESM-only setup guarantees cleaner semantics and future-friendly module resolution.

Create a Public Directory
=========================

Ivy serves static files from a ``./public`` directory by default.
To get started, create the folder and add a basic ``index.html``:

.. code-block:: bash

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

Start the server:

.. code-block:: bash

   export PATH="$PWD/node_modules/.bin:$PATH"
   ivy-server spin

Links
-----------------

.. toctree::
   :maxdepth: 2
   :caption: Documentation

   cli

Support Nutsloop
----------------

Support open-source work at Nutsloop by becoming a GitHub Sponsor:

* https://github.com/sponsors/nutsloop

----

Love is modular, baby. So is Ivy Server.

``💚 if you love ivy-server 53450, ivy-server loves you twice.``
