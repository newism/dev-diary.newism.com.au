---
title: Add CraftCMS Control Panel styling to your module / plugin
date: 2022-03-12
author: Leevi Graham
gravatar: d613d2145633372c632e1a02a49657e0
twitter: '@leevigraham'
---

Keep your plugin / module UI consistent with the CraftCMS Control Panel using the official sass mixins.

---

The CraftCMS Control Panel uses a set [sass mixins](https://github.com/craftcms/sass/blob/main/_mixins.scss)
to keep styling consistent. Mixins include:

* Colour variables
* RTL support for borders, padding, text alignment
* Input styles
* Menu styles
* Readable text

To use the mixins you'll need to build your plugin / module
asset bundle with a build tool like webpack or vite that supports `scss` imports.

My last post shows you [how to setup Webpack to build asset bundles](/posts/webpack-hot-module-reloading-craftcms-assetbundles.html).

Install the package in your asset bundle `package.json`:

```bash
npm i @craftcms/sass --save-dev
```

Import the [`@craftcms/sass`](https://www.npmjs.com/package/@craftcms/sass)
mixins into your `.scss` file.

```scss
@import "@craftcms/sass/mixins";
```

Use the mixins in your custom classes:

```scss
.my-custom-input {
  @include input-styles;
}
```

## Sidenote

The `@craftcms/sass` package is updated as part of the 
[`craftcms/cms` Github repository](https://github.com/craftcms/cms/tree/develop/packages/craftcms-sass) 
and published with [Lerna](https://github.com/lerna/lerna).
