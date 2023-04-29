# SPDX-FileCopyrightText: 2022 Deminder <tremminder@gmail.com>
# SPDX-License-Identifier: GPL-3.0-or-later

UUID := $(shell grep uuid src/metadata.json | cut -d\" -f 4)
$(info Version: $(shell grep -oP '^ *?\"version\": *?\K(\d+)' src/metadata.json) ($(UUID)))

SOURCE_FILES := po/*.po $(shell find src -type f)

ZIP_FILE := target/$(UUID).shell-extension.zip

all: $(ZIP_FILE)

$(ZIP_FILE): $(SOURCE_FILES)
	@mkdir -p target
	gnome-extensions pack src \
		--podir "../po" \
		--force \
		--out-dir="target"
zip: $(ZIP_FILE)

lint:
	npm run lint
	npm run prettier

install: $(ZIP_FILE)
	gnome-extensions install --force $(ZIP_FILE)

clean:
	-rm -rf target

.PHONY: install clean lint zip
