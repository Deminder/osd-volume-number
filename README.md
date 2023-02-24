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

## Development

### Debug

Install on a virtual/remote host for debugging:

```(shell)
./scripts/install_on_guest.sh $GUEST_SSH_ADDRESS
```

### Update Translations

Extract transalable text from sources to template file `po/main.pot` and update `.po` files:

```(shell)
./scripts/update-pod.sh
```
### References

- https://gjs.guide/extensions/
- https://gjs.guide/guides/
- https://gjs-docs.gnome.org/
- https://github.com/Deminder/battery-indicator-icon
- https://github.com/Deminder/ShutdownTimer
