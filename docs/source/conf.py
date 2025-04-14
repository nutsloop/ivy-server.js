import os
# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = 'nutsloop::ivy-server'
copyright = '2025, nutsloop, Simone Del Popolo'
author = 'nutsloop, Simone Del Popolo'
release = '1.3.0-alpha.8'  # Full version, including alpha/beta tags
version = '1.3.0'        # Short version (e.g., for stable tags)

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = []

templates_path = ['_templates']
exclude_patterns = []

# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = 'shibuya'
html_static_path = ['_static']
html_css_files = ['content.css']

html_js_files = []

if os.environ.get('LIVERELOAD'):
    html_js_files.append('live-reload.js')
