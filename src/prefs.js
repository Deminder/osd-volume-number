// SPDX-FileCopyrightText: 2023 Deminder <tremminder@gmail.com>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Adw, Gio, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Gettext = imports.gettext.domain('battery-indicator-icon');
const _ = Gettext.gettext;

function init() {
  ExtensionUtils.initTranslations();
}

function createComboRow(title, options) {
  const model = new Gtk.StringList();
  for (const opt of Object.values(options)) {
    model.append(opt);
  }
  const row = new Adw.ComboRow({
    title,
    model,
    selected: 0,
  });
  return row;
}

function fillPreferencesWindow(window) {
  const settings = ExtensionUtils.getSettings();

  const page = new Adw.PreferencesPage();
  const group = new Adw.PreferencesGroup();
  page.add(group);

  const numberPosOpts = {
    left: _('Left'),
    right: _('Right'),
    hidden: _('Hidden'),
  };
  const numberPosRow = createComboRow(_('Number position'), numberPosOpts);

  const iconPosOpts = {
    hidden: _('Hidden'),
    left: _('Left'),
    right: _('Right'),
  };
  const iconPosRow = createComboRow(_('Icon position'), iconPosOpts);

  const updateOpt = () => {
    // GUI update
    const numberPos = Object.keys(numberPosOpts)[numberPosRow.selected];
    const iconPos = Object.keys(iconPosOpts)[iconPosRow.selected];
    settings.set_string('number-position', numberPos);
    settings.set_string('icon-position', iconPos);
  };

  const updateSetting = () => {
    // Setting update
    numberPosRow.selected = Object.keys(numberPosOpts).indexOf(
      settings.get_string('number-position')
    );
    iconPosRow.selected = Object.keys(iconPosOpts).indexOf(
      settings.get_string('icon-position')
    );
  };
  const handlerIds = [
    settings.connect('changed::number-position', updateSetting),
    settings.connect('changed::icon-position', updateSetting),
  ];
  updateSetting();
  iconPosRow.connect('notify::selected', updateOpt);
  numberPosRow.connect('notify::selected', updateOpt);

  group.add(numberPosRow);
  group.add(iconPosRow);
  page.connect('destroy', () => {
    for (const hid of handlerIds) {
      settings.disconnect(hid);
    }
  });

  window.default_width = 500;
  window.default_height = 220;
  window.add(page);
}
