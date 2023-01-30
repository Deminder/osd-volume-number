// SPDX-FileCopyrightText: 2022 Deminder <tremminder@gmail.com>
// SPDX-License-Identifier: GPL-3.0-or-later

/* exported init */
const { Clutter, GObject, St, Gio } = imports.gi;
const Main = imports.ui.main;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

class Extension {
  constructor() {
    ExtensionUtils.initTranslations();
  }

  enable() {
    this.sid = Main.layoutManager.connect(
      'monitors-changed',
      this._repatch.bind(this)
    );
    this._settings = ExtensionUtils.getSettings();
    this._updateSignalIds = ['number-position', 'icon-position'].map(prop =>
      this._settings.connect(`changed::${prop}`, this._updateVisible.bind(this))
    );
    this._patch();
  }

  _repatch() {
    this._unpatch();
    this._patch();
  }

  _updateVisible() {
    for (const w of this.osdWindows) {
      if ('_numlabel_left' in w) {
        const levelVis = w._level.visible;
        const numberPos = levelVis
          ? this._settings.get_string('number-position')
          : 'hidden';
        const iconPos = levelVis
          ? this._settings.get_string('icon-position')
          : 'left';
        w._numlabel_left.visible = numberPos === 'left';
        w._numlabel_right.visible = numberPos === 'right';
        w._icon.visible = iconPos === 'left';
        w._icon_right.visible = iconPos === 'right';
      }
    }
  }

  _patch() {
    // patching children in js/ui/osdWindow.js::OsdWindow
    for (const w of this.osdWindows) {
      if (!('_numlabel_left' in w)) {
        for (const side of ['left', 'right']) {
          const numlabel = new St.Label({
            y_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
            style_class: `number-label number-label-${side}`,
          });
          w._level.bind_property_full(
            'value',
            numlabel,
            'text',
            GObject.BindingFlags.SYNC_CREATE,
            (__, v) => [true, (v * 100).toFixed()],
            null
          );
          w[`_numlabel_${side}`] = numlabel;
        }
        w._levelSignalId = w._level.connect(
          'notify::visible',
          this._updateVisible.bind(this)
        );
        w._icon_right = new St.Icon({ y_expand: true });
        w._icon.bind_property(
          'gicon',
          w._icon_right,
          'gicon',
          GObject.BindingFlags.SYNC_CREATE
        );

        const b = w._hbox;
        b.remove_all_children();
        b.add_child(w._icon);
        b.add_child(w._numlabel_left);
        b.add_child(w._vbox);
        b.add_child(w._numlabel_right);
        b.add_child(w._icon_right);
      }
    }
    this._updateVisible();
  }

  _unpatch() {
    for (const w of this.osdWindows) {
      if ('_numlabel_left' in w) {
        w._numlabel_left.destroy();
        delete w['_numlabel_left'];
        w._numlabel_right.destroy();
        delete w['_numlabel_right'];
        w._icon_right.destroy();
        delete w['_icon_right'];

        w._level.disconnect(w._levelSignalId);
        delete w['_levelSignalId'];

        w._icon.visible = true;
        w._hbox.remove_all_children();
        w._hbox.add_child(w._icon);
        w._hbox.add_child(w._vbox);
      }
    }
  }

  get osdWindows() {
    return Main.osdWindowManager._osdWindows;
  }

  disable() {
    if (this.sid) {
      Main.layoutManager.disconnect(this.sid);
    }
    this.sid = null;
    if (this._settingsIds) {
      for (const sid of this._settingsIds) {
        this._settings.disconnect(sid);
      }
      this._settingsIds = null;
    }
    this._settings = null;
    this._unpatch();
  }
}

function init() {
  return new Extension();
}
