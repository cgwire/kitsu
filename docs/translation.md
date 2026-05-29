# Add a translation


## Add a language file

1. Create a `<lang>.json` file in `src/locales`, mirroring the structure of
   `en.js` (the source of truth) or an existing locale.
2. Add the corresponding entry in the `src/locales/index.js` file.
3. Add an entry in the profile file at the option level.
   Be careful, you must use a locale name available in Python Babel or it will
   break the person entry.


## Add a translation key

TODO
