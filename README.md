# Moonfin for Tizen

### Enhanced Jellyfin client for Samsung Tizen TVs

[![License](https://img.shields.io/github/license/Moonfin-Client/jellyfin-tizen)](LICENSE)
[![Release](https://img.shields.io/github/v/release/Moonfin-Client/jellyfin-tizen)](https://github.com/Moonfin-Client/jellyfin-tizen/releases)


<a href="https://www.buymeacoffee.com/moonfin" target="_blank"><img src="https://github.com/user-attachments/assets/fe26eaec-147f-496f-8e95-4ebe19f57131" alt="Buy Me A Coffee" ></a>


> [← Back to main Moonfin project](https://github.com/Moonfin-Client)

Moonfin for Tizen is an enhanced fork of the official Jellyfin Tizen client, optimized for the viewing experience on Samsung Smart TVs.

## Features & Enhancements

Moonfin for Tizen builds on the solid foundation of Jellyfin with targeted improvements for TV viewing:

### Cross-Server Content Playback
* **Unified Library Support** - Seamless playback from multiple Jellyfin servers
* Seamless switching between servers for content playback
* Improved server selection logic

### Jellyseerr Integration (Beta)
Moonfin is the first Tizen client with native Jellyseerr support.

* Browse trending, popular, and recommended movies/shows and filter content by Series/Movie Genres, Studio, Network, and keywords
* Request content in HD or 4K directly from your TV
* NSFW Content Filtering (optional) using Jellyseerr/TMDB metadata
* Smart season selection when requesting TV shows
* View all your pending, approved, and available requests
* Authenticate using your Jellyfin login (permanent local API key saved)
* Global search includes Jellyseerr results
* Rich backdrop images for a more cinematic discovery experience

### 🛠️ Customizable Toolbar
* Toggle buttons - Show/hide Shuffle, Genres, and Favorites buttons
* Library row toggle - Show/hide the entire library button row for a cleaner home screen
* Shuffle filter - Choose Movies only, TV Shows only, or Both
* Pill-shaped design - Subtle rounded background with better contrast
* Dynamic library buttons that scroll horizontally for 5+ libraries

### 🎬 Featured Media Bar
* Rotating showcase of 15 random movies and TV shows right on your home screen
* Profile-aware refresh - Automatically refreshes content when switching profiles to prevent inappropriate content from appearing on child profiles
* See ratings, genres, runtime, and a quick overview without extra clicks
* Smooth crossfade transitions as items change, with matching backdrop images
* Height and positioning tuned for viewing from the couch

### 🧭 Enhanced Navigation
* Quick access home button (house icon) and search (magnifying glass)
* Shuffle button for instant random movie/TV show discovery
* Genres menu to browse all media by genre in one place
* Dynamic library buttons automatically populate based on your Jellyfin libraries
* One-click navigation to any library or collection directly from the toolbar
* Cleaner icon-based design for frequently used actions

### 🎵 Playback & Media Control
* **Theme Music Playback** - Background theme music support for TV shows and movies with volume control
* **Pre-Playback Track Selection** - Choose your preferred audio track and subtitle before playback starts (configurable in settings)
* **Next Episode Countdown** - Skip button shows countdown timer when next episode is available
* **Automatic Screensaver Dimming** - Reduces brightness after 90 seconds of playback inactivity to prevent screen burn-in with dynamic logo/clock movement
* **Exit Confirmation Dialog** - Optional confirmation prompt when exiting the app (configurable in settings)
* **OTA Update System** - Automatic check for new Moonfin versions with in-app update notifications

### 📊 Improved Details Screen
* Metadata organized into clear sections: genres, directors, writers, studios, and runtime
* Taglines displayed above the description where available
* Cast photos appear as circles for a cleaner look
* Fits more useful information on screen without feeling cramped

### 🎨 UI Polish
* **Adjustable Backdrop Blur** - Customizable background blur amount with slider control for personal preference
* **Media Bar Opacity Control** - Slider-based opacity adjustment for the featured media bar overlay
* Item details show up right in the row, no need to open every title to see what it is
* Buttons look better when not focused (transparent instead of distracting)
* Better contrast makes text easier to read
* Transitions and animations feel responsive
* Consistent icons and visual elements throughout

## Installation

### Pre-built Releases

Download the latest WGT package from the [Releases page](https://github.com/Moonfin-Client/jellyfin-tizen/releases).

**Supported Devices:**
* Samsung Tizen TVs (2016 and newer)
* Tizen 2.4+ (Tizen 5.5+ recommended)

### Jellyseerr Setup (Optional)

To enable media discovery and requesting:

1. Install and configure Jellyseerr on your network ([jellyseerr.dev](https://jellyseerr.dev/))
2. In Moonfin, go to Settings → Jellyseerr
3. Enter your Jellyseerr server URL (e.g., `http://192.168.1.100:5055`)
4. Click Connect with Jellyfin and enter your Jellyfin password
5. Test the connection, then start discovering!

Your session is saved securely and will reconnect automatically.

### Installation Instructions

1. Enable Developer Mode on your Samsung TV. See [Enable Developer Mode on the TV](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html#Connecting-the-TV-and-SDK)
2. Connect to your TV using Tizen Studio Device Manager or sdb
3. Install the WGT package using Tizen Studio or command line

_For detailed installation steps, see the [Wiki](https://github.com/Moonfin-Client/jellyfin-tizen/wiki)._

## Building from Source

### Prerequisites
* Tizen Studio 4.6+ with IDE or Tizen Studio 4.6+ with CLI. See [Installing TV SDK](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/installing-tv-sdk.html)
* Git
* Node.js 20+

### Steps

1. **Install prerequisites** and setup Tizen Certificate Manager. See [Creating Certificates](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/creating-certificates.html)
   > If you have installation problems with the Tizen certificate, try creating a Samsung certificate. In this case, you will also need a Samsung account.

2. **Clone Jellyfin Web repository:**
   > It is recommended that the web version match the server version.
   ```sh
   git clone -b release-10.10.z https://github.com/jellyfin/jellyfin-web.git
   ```
   > Replace `release-10.10.z` with the name of the branch you want to build.

3. **Clone Moonfin Tizen repository:**
   ```sh
   git clone https://github.com/Moonfin-Client/jellyfin-tizen.git
   ```

4. **Build Jellyfin Web:**
   ```sh
   cd jellyfin-web
   npm ci --no-audit
   USE_SYSTEM_FONTS=1 npm run build:production
   ```
   > You should get `jellyfin-web/dist/` directory.
   
   > `USE_SYSTEM_FONTS=1` is required to discard unused fonts and to reduce the size of the app.
   
   > Use `npm run build:development` if you want to debug the app.

5. **Prepare Interface:**
   ```sh
   cd ../jellyfin-tizen
   JELLYFIN_WEB_DIR=../jellyfin-web/dist npm ci --no-audit
   ```
   > You should get `jellyfin-tizen/www/` directory.

6. **Build WGT package:**
   > Make sure you select the appropriate Certificate Profile in Tizen Certificate Manager. This determines which devices you can install the widget on.
   ```sh
   tizen build-web -e ".*" -e gulpfile.babel.js -e README.md -e "node_modules/*" -e "package*.json" -e "yarn.lock"
   tizen package -t wgt -o . -- .buildResult
   ```
   > You should get `Moonfin.wgt`.

## Deployment

### Deploy to Emulator

1. Run emulator
2. Install package:
   ```sh
   tizen install -n Moonfin.wgt -t T-samsung-5.5-x86
   ```
   > Specify target with `-t` option. Use `sdb devices` to list them.

### Deploy to TV

1. Run TV
2. Activate Developer Mode on TV. See [Enable Developer Mode on the TV](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html#Connecting-the-TV-and-SDK)
3. Connect to TV with one of the following options:
   * Device Manager from `Tools -> Device Manager` in Tizen Studio
   * sdb:
      ```sh
      sdb connect YOUR_TV_IP
      ```
4. If you are using a Samsung certificate, allow installs onto your TV using your certificate with one of the following options:
   > If you need to change or create a new Samsung certificate, you will need to re-build WGT once you have the Samsung certificate you'll use for the install.

   * Device Manager from `Tools -> Device Manager` in Tizen Studio:
      * Right-click on the connected device, and select `Permit to install applications`

   * Tizen CLI:
      ```sh
      tizen install-permit -t UE65NU7400
      ```
      > Specify target with `-t` option. Use `sdb devices` to list them.

   * sdb:
      ```sh
      sdb push ~/SamsungCertificate/<PROFILE_NAME>/*.xml /home/developer
      ```
5. Install package:
   ```sh
   tizen install -n Moonfin.wgt -t UE65NU7400
   ```
   > Specify target with `-t` option. Use `sdb devices` to list them.

## Development

### Developer Notes
* Uses Tizen Studio toolchain for building and packaging
* Tizen Studio is recommended for development
* Keep Tizen SDK and build tools updated
* Code style follows upstream Jellyfin conventions
* UI changes should be tested on actual TV devices when possible
* The `JELLYFIN_WEB_DIR` environment variable can be used to override the location of `jellyfin-web`

## Contributing

We welcome contributions to Moonfin for Tizen!

### Guidelines

1. **Check existing issues** - See if your idea/bug is already reported
2. **Discuss major changes** - Open an issue first for significant features
3. **Follow code style** - Match the existing codebase conventions
4. **Test on TV devices** - Verify changes work on actual Samsung Tizen TVs
5. **Consider upstream** - Features that benefit all users should go to Jellyfin first!

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with clear commit messages
4. Test thoroughly on Tizen TVs
5. Submit a pull request with a detailed description

## Translating

Translations are maintained through the Jellyfin Weblate instance:

* [Jellyfin Android TV on Weblate](https://translate.jellyfin.org/projects/jellyfin-android/jellyfin-androidtv)

Translations contributed to Moonfin that are universally applicable will be submitted upstream to benefit the entire community.

## Support & Community

* **Issues** - [GitHub Issues](https://github.com/Moonfin-Client/jellyfin-tizen/issues) for bugs and feature requests
* **Discussions** - [GitHub Discussions](https://github.com/Moonfin-Client/jellyfin-tizen/discussions) for questions and ideas
* **Upstream Jellyfin** - [jellyfin.org](https://jellyfin.org/) for server-related questions

## Credits

Moonfin for Tizen is built upon the excellent work of:

* [Jellyfin Project](https://jellyfin.org/) - The foundation and upstream codebase
* [MakD](https://github.com/MakD) - Original Jellyfin-Media-Bar concept that inspired our featured media bar
* Jellyfin Tizen Contributors - All the developers who built the original client
* Moonfin Contributors - Everyone who has contributed to this fork

## License

This project inherits the GPL v2 license from the upstream Jellyfin Tizen project. See the [LICENSE](LICENSE) file for details.

Moonfin for Tizen is an independent fork and is not affiliated with the Jellyfin project.

---

> [← Back to main Moonfin project](https://github.com/Moonfin-Client)

