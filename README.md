APK Analyzer
============

This is the source code for [apkanalyzer.xyz](https://apkanalyzer.xyz/).

It's similar to the APK analyzer that you find in Android Studio, expect
it works in the browser, and you just drop the APKs you want to inspect 
into your browser window.

You can then see it's contents, ordered by size, and figure out where you
might have fat to cut off.

If you like this, you might also enjoy [BundleCop](https://bundlecop.com/android),
which will automatically run your Bundles through the analyzer everytime
you change your code.

## Container image

GitHub Actions builds the static site and publishes immutable images to
`ghcr.io/bundlecop/apkanalyzer.io` on pushes to `master`.

In the future, we might be able to add some cool features, such as:

- Finding duplicate files.
- Drill down into .dex files.
- Find PNGs that can be further compressed. 
