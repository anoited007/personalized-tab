.DEFAULT_GOAL := help
.PHONY: help install build zip check-env upload publish release clean

VERSION := $(shell node -p "require('./manifest.json').version")
ZIP := releases/personalized-tab-v$(VERSION).zip

help: ## Show this help
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies from the lockfile
	npm ci

build: install ## Build the three Angular apps into dist-extension/
	npm run build

zip: build ## Zip dist-extension/ into releases/personalized-tab-v<version>.zip
	node scripts/package-extension.mjs

# Fails fast with a clear message instead of a cryptic API error when the
# Chrome Web Store credentials aren't set — see README's "Publishing" section
# for how to obtain them.
check-env:
ifndef EXTENSION_ID
	$(error EXTENSION_ID is not set)
endif
ifndef CLIENT_ID
	$(error CLIENT_ID is not set)
endif
ifndef CLIENT_SECRET
	$(error CLIENT_SECRET is not set)
endif
ifndef REFRESH_TOKEN
	$(error REFRESH_TOKEN is not set)
endif

upload: check-env zip ## Upload the zip to the Chrome Web Store as a draft (does not go live)
	npx chrome-webstore-upload-cli upload \
		--source "$(ZIP)" \
		--extension-id "$(EXTENSION_ID)" \
		--client-id "$(CLIENT_ID)" \
		--client-secret "$(CLIENT_SECRET)" \
		--refresh-token "$(REFRESH_TOKEN)"

publish: check-env ## Publish the most recently uploaded draft — this goes live for real users
	npx chrome-webstore-upload-cli publish \
		--extension-id "$(EXTENSION_ID)" \
		--client-id "$(CLIENT_ID)" \
		--client-secret "$(CLIENT_SECRET)" \
		--refresh-token "$(REFRESH_TOKEN)"

release: upload publish ## Build, zip, upload, and publish in one step — this goes live

clean: ## Remove all build/package output
	rm -rf dist dist-extension releases .angular/cache
