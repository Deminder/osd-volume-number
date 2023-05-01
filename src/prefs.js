// SPDX-FileCopyrightText: 2023 Deminder <tremminder@gmail.com>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Adw, Gio, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const { PACKAGE_VERSION } = imports.misc.config;
const MAJOR = Number.parseInt(PACKAGE_VERSION);
const Gettext = imports.gettext.domain('osd-volume-number');
const _ = Gettext.gettext;

function init() {
  ExtensionUtils.initTranslations();
}

function createSwitchRow(title) {
  const toggle = new Gtk.Switch({ valign: Gtk.Align.CENTER });
  const row = new Adw.ActionRow({ title });
  row.add_suffix(toggle);
  row.activatable_widget = toggle;
  return row;
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

  const adaptPanelMenuRow = createSwitchRow(_('Adapt panel menu slider'));

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
    adaptPanelMenuRow.activatableWidget.active =
      settings.get_boolean('adapt-panel-menu');
  };
  const handlerIds = [
    'number-position',
    'icon-position',
    'adapt-panel-menu',
  ].map(s => settings.connect(`changed::${s}`, updateSetting));
  updateSetting();
  iconPosRow.connect('notify::selected', updateOpt);
  numberPosRow.connect('notify::selected', updateOpt);

  settings.bind(
    'adapt-panel-menu',
    adaptPanelMenuRow.activatableWidget,
    'active',
    Gio.SettingsBindFlags.DEFAULT
  );

  group.add(numberPosRow);
  group.add(iconPosRow);
  if (MAJOR >= 44) group.add(adaptPanelMenuRow);
  page.connect('destroy', () => {
    for (const hid of handlerIds) {
      settings.disconnect(hid);
    }
  });

  window.default_width = 500;
  window.default_height = 220 + 40 * (MAJOR >= 44);
  window.add(page);
}
