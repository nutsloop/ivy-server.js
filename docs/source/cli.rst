.. _cli:

ivy-server CLI Reference
========================

The `@nutsloop/ivy-server` CLI is a modular command-line interface for launching and configuring development servers with ease and power.

.. note::

   **Alpha Warning**: This project is in early development. Expect breaking changes, bugs, and a little chaos. We document with love, but things may shift quickly.

Synopsis
--------

.. code-block:: bash

   ivy-server [--global-flag=options] <command> [--flag=options]

Global Flags
------------

Global flags must always appear **before** the command.

.. list-table::
   :header-rows: 1
   :widths: 25 75

   * - Flag
     - Description
   * - ``--ease``
     - Allows binding to ports below 1024.
   * - ``--ease-cluster``
     - Loosens cluster CPU restrictions (uses all CPUs).

Example:

.. code-block:: bash

   ivy-server --ease spin --port=80


Commands
========

spin
----

Run a single server instance.

.. code-block:: bash

   ivy-server spin [options]

cluster
-------

Run multiple server instances using Node's cluster module.

.. code-block:: bash

   ivy-server cluster [options]

Common Flags (spin & cluster)
-----------------------------

These flags are shared across both ``spin`` and ``cluster``.

.. list-table::
   :header-rows: 1
   :widths: 25 15 60

   * - Flag
     - Type
     - Description
   * - ``--socket[=number|void]``
     - optional
     - Enable socket/tls connection (requires ``socketConfig.js``).
   * - ``--port``, ``-p``
     - number
     - Port to run the server on.
   * - ``--address``, ``-a``
     - string
     - Address to bind.
   * - ``--https[=void|kvp]``
     - optional
     - Enable HTTPS.
   * - ``--www-root``
     - string
     - Directory for static content.
   * - ``--acme-challenge``
     - void
     - Serve ACME challenge files (skips redirects/multidomain).
   * - ``--mute-client-error``
     - void
     - Suppress client error logs.
   * - ``--log``
     - void
     - Enable request logging.
   * - ``--log-color``
     - void
     - Colorize log output (requires ``--log``).
   * - ``--log-persistent``
     - void/number
     - Persist logs via file/db (requires ``logConfig.js``).
   * - ``--cut-user-agent``
     - void
     - Hide user-agent in logs.
   * - ``--routes``
     - mixed
     - Enable route handling.
   * - ``--hot-routes``
     - void
     - Enable hot reloading of routes.
   * - ``--virtual-routes``
     - string
     - Declare 200-style fallback routes (needs ``--to-index-html``).
   * - ``--to-index-html``
     - void
     - Route all unmatched requests to ``index.html``.
   * - ``--control-room``
     - void
     - Open socket for stats/control panel.
   * - ``--served-by``
     - string
     - Set ``served-by`` HTTP header.
   * - ``--live-reload``
     - void/kvp
     - Enable live reload on file changes.
   * - ``--multi-domain``
     - string
     - Load multidomain config from file.

Cluster-Specific Flags
----------------------

These flags apply only when using the ``cluster`` command.

.. list-table::
   :header-rows: 1
   :widths: 25 15 60

   * - Flag
     - Type
     - Description
   * - ``--cpus``
     - number
     - Number of CPUs to utilize.
   * - ``--exec``
     - string
     - Path to entry file to execute in cluster.

.. _--exec:

--exec Flag
-----------

The ``--exec`` flag allows you to specify a path to a JavaScript file that will be executed by each worker process in a cluster environment.

This flag is only available when using the ``cluster`` command and is intended for programmatic or custom logic extensions.

Typically, you use ``--exec`` when you need your own server startup logic.

Auxiliary Commands
==================

help
----

Display CLI manual or help for a specific command or flag.

.. code-block:: bash

   ivy-server help [global] | [command] <[flag]>

version
-------

Print the current CLI version.

.. code-block:: bash

   ivy-server --version
   ivy-server -v
   ivy-server version

This command takes no flags.

----

Love is modular, baby. So is Ivy Server.

``💚 if you love ivy-server 53450, ivy-server loves you twice.``
