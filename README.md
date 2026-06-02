# Tokei

Tokei is a Tauri desktop clock for Windows that shows time as percentages of several overlapping timelines:

- minute
- hour
- day
- week
- month
- year
- optional life clock

The life clock is toggleable. On first launch, Tokei asks for date of birth and country for the optional life clock. This is fully local; no profile data is shared anywhere.

## Run

```powershell
cd D:\Jess\codexfun\tokei-tauri
npm install
npm start
```

## Build

```powershell
npm run build
```

## Linux Build

Linux packages are built with GitHub Actions because Tauri needs Linux system libraries that are not available in a normal Windows build environment.

After this project is pushed to GitHub:

1. Open the repository on GitHub.
2. Go to the Actions tab.
3. Select Build Linux.
4. Click Run workflow.
5. Download the `tokei-linux-0.1.3` artifact from the completed run.

The workflow builds:

- AppImage
- deb
- rpm

## Data

Life expectancy data is stored locally in:

```text
data/life-expectancy.json
```

The Tauri backend embeds this file at compile time and exposes it to the web UI through a local command.

The file was generated from the World Bank indicator:

```text
SP.DYN.LE00.IN - Life expectancy at birth, total (years)
```

Source URL:

```text
https://data.worldbank.org/indicator/SP.DYN.LE00.IN
```

The app uses the latest available value per country and filters out aggregate regions.

## Features

- Custom frameless Tauri window with Windows-style controls.
- First-run onboarding for date of birth and country.
- Country selector populated from the local World Bank dataset.
- Profile stored locally in `localStorage`.
- Life clock toggle. It can be turned on or off any time.
- Live percentage clocks updating four times per second.
- Percentage cards for minute, hour, day, week, month, and year.
- Optional life panel with a disabled slider reflecting life percentage elapsed.
- Editable profile after onboarding.
- Four radically different themes:
  - Aurora: glassy, luminous desktop-app style.
  - Gaia: light, calm, organic.
  - Cherry: saturated neon magenta/yellow.
  - Canopy: terminal-like green-on-black.

## Life Clock Notes

The optional life clock uses date of birth, selected country, and the local life expectancy dataset. It does not send date of birth, country, or any profile data anywhere.

## Files

```text
tokei-tauri/
|-- data/
|   `-- life-expectancy.json
|-- assets/
|   |-- tokei-icon.ico
|   |-- tokei-icon.svg
|   `-- tokei-icon-*.png
|-- src/
|   |-- index.html
|   |-- renderer.js
|   `-- styles.css
|-- src-tauri/
|   |-- icons/
|   |-- src/
|   |   `-- main.rs
|   |-- build.rs
|   |-- Cargo.toml
|   `-- tauri.conf.json
|-- package.json
|-- package-lock.json
`-- README.md
```
