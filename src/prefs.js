// SPDX-FileCopyrightText: 2023 Deminder <tremminder@gmail.com>
// SPDX-License-Identifier: GPL-3.0-or-later

import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import {
  ExtensionPreferences,
  gettext as _,
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class ShutdownTimerPreferences extends ExtensionPreferences {
  createSwitchRow(title) {
    const toggle = new Gtk.Switch({ valign: Gtk.Align.CENTER });
    const row = new Adw.ActionRow({ title });
    row.add_suffix(toggle);
    row.activatable_widget = toggle;
    return row;
  }

  createComboRow(title, options) {
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

  /**
   * Fill the preferences window with preferences.
   *
   * The default implementation adds the widget
   * returned by getPreferencesWidget().
   *
   * @param {Adw.PreferencesWindow} window - the preferences window
   */
  fillPreferencesWindow(window) {
    const settings = this.getSettings();

    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup();
    page.add(group);

    const numberPosOpts = {
      left: _('Left'),
      right: _('Right'),
      hidden: _('Hidden'),
    };
    const numberPosRow = this.createComboRow(
      _('Number position'),
      numberPosOpts
    );

    const iconPosOpts = {
      hidden: _('Hidden'),
      left: _('Left'),
      right: _('Right'),
    };
    const iconPosRow = this.createComboRow(_('Icon position'), iconPosOpts);

    const adaptPanelMenuRow = this.createSwitchRow(
      _('Adapt panel menu slider')
    );

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
    group.add(adaptPanelMenuRow);
    page.connect('destroy', () => {
      for (const hid of handlerIds) {
        settings.disconnect(hid);
      }
    });

    window.default_width = 500;
    window.default_height = 260;
    window.add(page);
  }
}
