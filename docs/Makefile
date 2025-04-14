# Minimal Makefile for Sphinx documentation with optional live-reload.js

SPHINXOPTS    ?=
SPHINXBUILD   ?= sphinx-build
SOURCEDIR     = source
BUILDDIR      = build
STATICDIR     = $(SOURCEDIR)/_static
JSFILE        = $(SOURCEDIR)/live-reload/live-reload.js
STATICJS      = $(STATICDIR)/live-reload.js

.PHONY: help clean html

help:
	@$(SPHINXBUILD) -M help "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS)

clean:
	@echo "Cleaning build directory and removing live-reload.js..."
	@rm -rf "$(BUILDDIR)"
	@rm -f "$(STATICJS)"

html: clean
ifeq ($(LIVERELOAD),1)
	@echo "Copying live-reload.js to _static..."
	@cp "$(JSFILE)" "$(STATICJS)"
endif
	@$(SPHINXBUILD) -b html "$(SOURCEDIR)" "$(BUILDDIR)/html" $(SPHINXOPTS)
