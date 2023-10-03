<!--
SPDX-FileCopyrightText: 2023 Deminder <tremminder@gmail.com>

SPDX-License-Identifier: GPL-3.0-or-later
-->

# OSD Volume Number
Replace the on-screen-display volume level icon with a number.

![number right](data/number_right.png)
<a href="https://extensions.gnome.org/extension/5461/osd-volume-number">
<img alt="Get it on GNOME Extensions" width="228" src="https://raw.githubusercontent.com/andyholmes/gnome-shell-extensions-badge/master/get-it-on-ego.svg?sanitize=true"></img>
</a>

Additionally, icon and number may be shown to the left and the right of the level bar:

![icon left number right](data/icon_left_number_right.png)![icon right number right](data/icon_right_number_right.png)

## Manual Installation

Requires `gnome-shell-extensions` and `gettext`:

```(shell)
make install
```
OR automatically switch to the last supported release version before install `make supported-install`.

## Development

### Debug

Install via `$GUEST_SSHCMD` on a virtual/remote host `$GUEST_SSHADDR` for debugging:

```(shell)
GUEST_SSHCMD=ssh GUEST_SSHADDR=guest@vm make debug-guest
```

### Update Translations

Extract transalable text from sources to template file `po/main.pot` and update `.po` files:

```(shell)
make translations
```
### References

- https://gjs.guide/extensions/
- https://gjs.guide/guides/
- https://gjs-docs.gnome.org/
- https://github.com/Deminder/battery-indicator-icon
- https://github.com/Deminder/ShutdownTimer
