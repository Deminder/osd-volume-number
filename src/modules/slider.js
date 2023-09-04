// SPDX-FileCopyrightText: 2022 Deminder <tremminder@gmail.com>
// SPDX-License-Identifier: GPL-3.0-or-later

import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

export class SliderNumberPatch {
  constructor(widget, settings) {
    this.widget = widget;
    this._settings = settings;

    this.numlabel = new St.Label({
      y_expand: true,
      y_align: Clutter.ActorAlign.CENTER,
      style_class: this.styleClass,
    });
    this.slider.bind_property_full(
      'value',
      this.numlabel,
      'text',
      GObject.BindingFlags.SYNC_CREATE,
      (__, v) => [true, (v * 100).toFixed()],
      null
    );
    this._sliderVisibleSignalId = this.slider.connect(
      'notify::visible',
      this._sync.bind(this)
    );

    this._settingsIds = ['number-position', 'icon-position'].map(prop =>
      this._settings.connect(`changed::${prop}`, this._sync.bind(this))
    );
    this._sync();
  }

  get styleClass() {
    return 'number-label';
  }

  get icon() {
    return this.widget._icon;
  }

  get slider() {
    return this.widget._level;
  }

  get box() {
    return this.widget._hbox;
  }

  get sliderContainer() {
    return this.widget._vbox;
  }

  get iconContainer() {
    return this.icon;
  }

  _updateSliderSibling(sibling, position) {
    const parent = sibling.get_parent();
    if (parent !== null) {
      parent.remove_child(sibling);
    }
    this.box[
      position === 'right' ? 'insert_child_above' : 'insert_child_below'
    ](sibling, this.sliderContainer);
    sibling.visible = position !== 'hidden';
  }

  _sync() {
    this._updateSliderSibling(
      this.iconContainer,
      this.slider.visible ? this._settings.get_string('icon-position') : 'left'
    );
    this._updateSliderSibling(
      this.numlabel,
      this.slider.visible
        ? this._settings.get_string('number-position')
        : 'hidden'
    );
  }

  unpatch() {
    for (const sid of this._settingsIds) {
      this._settings.disconnect(sid);
    }
    this._settingsIds = null;
    this.slider.disconnect(this._sliderVisibleSignalId);
    this.numlabel.destroy();
    this.box.remove_child(this.iconContainer);
    this.box.insert_child_below(this.iconContainer, this.sliderContainer);
    this.iconContainer.visible = true;
  }
}

export class QuickSettingsSliderNumberPatch extends SliderNumberPatch {
  get styleClass() {
    return 'menu-number-label';
  }

  get slider() {
    return this.widget.slider;
  }

  get box() {
    return this.widget.get_child();
  }

  get sliderContainer() {
    return this.slider.get_parent();
  }

  get iconContainer() {
    return this.widget._iconButton;
  }

  resetIconReplacement() {
    if (this.iconContainerBinding) {
      this.iconContainerBinding.unbind();
      this.iconContainerBinding = null;
      this.iconContainer.label = null;
    }
    if (this.iconStyleClass) {
      this.iconContainer.styleClass = this.iconStyleClass;
      this.iconStyleClass = null;
    }
    this.iconContainer.child = this.icon;
  }

  _sync() {
    this.resetIconReplacement();
    super._sync();
    if (!this.iconContainer.visible && this.numlabel.visible) {
      // Enable mute toggling via number if icon is not shown
      this.iconStyleClass = this.iconContainer.styleClass;
      this.iconContainer.styleClass = `${this.iconStyleClass} menu-number-label`;
      this.box.remove_child(this.iconContainer);
      this.box.replace_child(this.numlabel, this.iconContainer);
      this.iconContainerBinding = this.numlabel.bind_property(
        'text',
        this.iconContainer,
        'label',
        GObject.BindingFlags.SYNC_CREATE
      );
      this.iconContainer.visible = true;
    }
  }

  unpatch() {
    this.resetIconReplacement();
    super.unpatch();
  }
}
