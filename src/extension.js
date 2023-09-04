// SPDX-FileCopyrightText: 2022 Deminder <tremminder@gmail.com>
// SPDX-License-Identifier: GPL-3.0-or-later

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { InjectionTracker } from './modules/sdt/injection.js';
import {
  SliderNumberPatch,
  QuickSettingsSliderNumberPatch,
} from './modules/slider.js';

export default class OsdVolumeNumber extends Extension {
  tracker = new InjectionTracker();

  enable() {
    this._settings = this.getSettings();
    this.settingsId = this._settings.connect(
      'changed::adapt-panel-menu',
      this._repatch.bind(this)
    );
    this.sid = Main.layoutManager.connect(
      'monitors-changed',
      this._repatch.bind(this)
    );
    this.patches = [];
    this._patch();
  }

  _repatch() {
    this._unpatch();
    this._patch();
  }

  _patch() {
    // Patch children in js/ui/osdWindow.js::OsdWindow
    // and panel menu input/output volume slider in js/ui/quickSettings.js::QuickSlider
    const qs = Main.panel.statusArea.quickSettings;
    this.patches = this.osdWindows.map(
      w => new SliderNumberPatch(w, this._settings)
    );
    if (this._settings.get_boolean('adapt-panel-menu')) {
      const patchQS = () => {
        for (const w of [qs._volumeInput._input, qs._volumeOutput._output]) {
          this.patches.push(
            new QuickSettingsSliderNumberPatch(w, this._settings)
          );
        }
      };
      const indicatorsReady = '_volumeInput' in qs;
      if (indicatorsReady) {
        patchQS();
      } else {
        const injection = this.tracker.injectProperty(
          qs,
          '_addItems' in qs ? '_addItems' : '_addItemsBefore',
          (...args) => {
            patchQS();
            injection.clear();
            injection.previous.call(qs, ...args);
          }
        );
      }
    }
  }

  _unpatch() {
    this.tracker.clearAll();
    for (const p of this.patches) {
      p.unpatch();
    }
    this.patches = [];
  }

  get osdWindows() {
    return Main.osdWindowManager._osdWindows;
  }

  disable() {
    this._settings.disconnect(this.settingsId);
    this._settings = null;
    this.settingsId = null;
    Main.layoutManager.disconnect(this.sid);
    this.sid = null;
    this._unpatch();
  }
}
