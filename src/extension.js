// SPDX-FileCopyrightText: 2022 Deminder <tremminder@gmail.com>
// SPDX-License-Identifier: GPL-3.0-or-later

/* exported init */
const { Clutter, GObject, St } = imports.gi;
const Main = imports.ui.main;

class Extension {
  enable() {
    this._patchWindows();
    this.sid = Main.layoutManager.connect(
      'monitors-changed',
      this._patchWindows.bind(this)
    );
  }

  _patchWindows() {
    const windows = Main.osdWindowManager._osdWindows;
    // patch osd
    for (const w of windows) {
      if (!('_numlabel' in w)) {
        w._hbox.remove_all_children();
        w._numlabel = new St.Label({
          y_expand: true,
          y_align: Clutter.ActorAlign.CENTER,
          style_class: 'number-label',
        });
        w._hbox.add_child(w._numlabel);
        w._level.bind_property_full(
          'value',
          w._numlabel,
          'text',
          GObject.BindingFlags.SYNC_CREATE,
          (__, v) => [true, (v * 100).toFixed()],
          null
        );
        w._hbox.add_child(w._vbox);
      }
    }
  }

  disable() {
    if (this.sid) {
      Main.layoutManager.disconnect(this.sid);
    }
  }
}

function init() {
  return new Extension();
}
