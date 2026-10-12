# AYNO FIELD

Applicazione per supportare Presales / AV Solution Architect durante i sopralluoghi tecnici.

## Android / Capacitor

Il progetto usa Capacitor come wrapper Android della web app. La sorgente web resta nella cartella `www/`.

### Build APK con GitHub Actions

La workflow `.github/workflows/android-apk.yml` compila automaticamente un APK debug e lo pubblica come artifact `AYNO_FIELD_APK`.

### Build locale

```bash
npm install
npx cap add android
npm run cap:sync
cd android
./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

## Versione

0.9.3
