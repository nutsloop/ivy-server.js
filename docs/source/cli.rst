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
   :widths: 40 7 53

   * - Flag
     - Type
     - Description
   * - ``--ease``, ``-e``
     - void
     - Allows binding to ports below 1024 (note: system-level restrictions may still apply).
   * - ``--ease-cluster``, ``-ec``
     - void
     - Removes cluster CPU limits — allows forking **any number** of workers. By default, forks half the available CPUs unless a specific number is provided.

Example:

.. code-block:: bash

   # let’s assume the server has 8 CPUs available and system-level port restrictions have been eased.
   ivy-server --ease --ease-cluster cluster --port=80 --cpus=32


Commands
========

spin
----

Run a single server instance.

.. code-block:: bash

   ivy-server spin

cluster
-------

Run multiple server instances using Node's cluster module.

.. code-block:: bash

   # this will fork for the half of the available cpus
   ivy-server cluster

Common Flags (spin & cluster)
-----------------------------

These flags are shared across both ``spin`` and ``cluster``.

.. list-table::
   :header-rows: 1
   :widths: 40 7 53

   * - Flag
     - Type
     - Description
   * - ``--acme-challenge``, ``-ac``
     - void
     - Serve ACME challenge files (skips redirects/multidomain).
   * - ``--address``, ``-a``
     - string
     - Address to bind.
   * - ``--control-room``, ``-cr``
     - void
     - Open socket for stats/control panel.
   * - ``--cut-user-agent``, ``-cua``
     - void
     - Hide user-agent in logs.
   * - ``--hot-routes``, ``-hr``
     - void
     - Enable hot reloading of routes.
   * - ``--https``, ``-S``
     - void/kvp
     - Enable HTTPS.
   * - ``--live-reload``, ``-lr``
     - void/kvp
     - Enable live reload on file changes.
   * - ``--log``, ``-l``
     - void
     - Enable request logging.
   * - ``--log-color``, ``-lc``
     - void
     - Colorize log output (requires ``--log``).
   * - ``--log-persistent``, ``-lp``
     - void/number
     - Persist logs via file/db (requires ``logConfig.js``).
   * - ``--log-request-headers``, ``-lrh``
     - void
     - Log request headers (requires ``--log``).
   * - ``--multi-domain``, ``-md``
     - string
     - Load multidomain config from file.
   * - ``--mute-client-error``, ``-mce``
     - void
     - Suppress client error logs.
   * - ``--plugins``, ``-P``
     - array
     - Comma-separated list of plugin names (no prefix needed).
   * - ``--port``, ``-p``
     - number
     - Port to run the server on.
   * - ``--redirect-to``, ``-rt``
     - string
     - Redirect to a different URL (301 Moved Permanently).
   * - ``--redirect-to-https``, ``-rth``
     - void
     - Redirect to HTTPS (requires ``--redirect-to``).
   * - ``--routes``, ``-r``
     - mixed
     - Enable route handling.
   * - ``--served-by``, ``-sb``
     - string
     - Set ``served-by`` HTTP header.
   * - ``--socket``, ``-s``
     - number/void
     - Enable socket/tls connection (requires ``socketConfig.js``).
   * - ``--to-index-html``, ``-tih``
     - void
     - Route all the requests to ``index.html``.
   * - ``--virtual-routes``, ``-vr``
     - string
     - Declare STATUS_CODE 200 for addresses (used with `--to-index-html`).
   * - ``--www-root``, ``-wr``
     - string
     - Directory for static content.

Cluster-Specific Flags
----------------------

These flags apply only when using the ``cluster`` command.

.. list-table::
   :header-rows: 1
   :widths: 30 15 55

   * - Flag
     - Type
     - Description
   * - ``--cpus``, ``-c``
     - number | void
     - Number of CPUs to utilize (restricted to the number of CPUs available). if void it will fork for the half of the available CPUs
   * - ``--exec``, ``-e``
     - string
     - Path to an entry file to execute in cluster.

.. _--exec:

--exec Flag
-----------
.. warning::
   This flag is only available when using the programmatic API interface and will throw an error if used directly with the ``ivy-server`` CLI interface.

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
