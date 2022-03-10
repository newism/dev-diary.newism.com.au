---
title: CraftCMS module / plugin development - Webpack Hot Module Reloading AssetBundles
date: 2022-03-11
author: Leevi Graham
gravatar: d613d2145633372c632e1a02a49657e0
twitter: '@leevigraham'
---

CraftCMS devs use Webpack Dev Server w/ Hot Module Reloading to generate module / plugin Asset Bundles. Now you can too.

---

Today I figured out how to use Crafts Webpack package to build module assets with Hot Module Reloading.
Here's how I got it running.

## Setup Craft

To get started you'll need:

1. A CraftCMS v3.7.22+ install (also tested in CraftCMS v4.0.0.beta.1)
2. A custom module or plugin.

For the rest of the article I'm assuming you'
ve [created a module following the Craft docs](https://craftcms.com/docs/3.x/extend/module-guide.html#preparation).

## Add NPM Dependencies

1. Create a `package.json` file in the root of your site (or use the one you have).
2. Add the `@craftcms/webpack` npm package: `npm i @craftcms/webpack --save-dev`

## Add Files to Craft

Create the new [Asset Bundle](https://craftcms.com/docs/3.x/extend/asset-bundles.html) folders / files.
Run the following in your console or create them manually.

```shell
mkdir -p modules/web/assets/cp/
mkdir -p modules/web/assets/cp/src/
mkdir -p modules/web/assets/cp/src/scss
touch modules/web/assets/cp/.env
touch modules/web/assets/cp/Asset.php
touch modules/web/assets/cp/webpack.config.js
touch modules/web/assets/cp/src/index.js
touch modules/web/assets/cp/src/scss/index.scss
```

Your project should look like this (only relevant folders / files shown):

```
my-app/
├─ modules/
│  ├─ web/
│  │  └─ assets/
│  │     └─ cp/
│  │        ├─ src/
│  │        │  ├─ scss/
│  │        │  │  └─ index.scss
│  │        │  └─ index.js
│  │        ├─ .env
│  │        ├─ Asset.php
│  │        └─ webpack.config.js
│  └─ Module.php
└─ package.json
```

Let's dig a little deeper. 

::: info
Copy and paste the examples provided into the corresponding files.
:::

### 📄 `modules/web/assets/cp/Asset.php`

This file loads all the built javascript / css. Our `Asset.php` looks like:

```php
<?php
namespace modules\web\assets\cp;

use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

class Asset extends AssetBundle
{
    public function init()
    {
        // define the path that your publishable resources live
        $this->sourcePath = __DIR__ . '/dist';

        // define the dependencies
        $this->depends = [
            CpAsset::class,
        ];

        // define the relative path to CSS/JS files
        // that should be registered with the page
        // when this asset bundle is registered
        $this->js = [
            'Asset.js',
        ];

        $this->css = [
            'css/Asset.css',
        ];

        parent::init();
    }
}
```

### 📄 `modules/Module.php`

The `Module.php` file [registers the `AssetBundle`](https://craftcms.com/docs/3.x/extend/asset-bundles.html#registering-the-asset-bundle)
.
This could happen anywhere but for this demo we're keeping it simple.

Here's the bare minimum `Module.php` file:

```php
<?php
namespace modules;

use Craft;
use modules\web\assets\cp\Asset;

class Module extends \yii\base\Module
{
    public function init()
    {
        Craft::$app->getView()->registerAssetBundle(Asset::class);
    }
}

```

### 📄 `modules/web/assets/cp/src/index.js`

This will become the webpack entry point. Import all your js modules and css/scss libraries here.

```js
import './scss/index.scss';

console.log("loaded");
```

### 📄 `modules/web/assets/cp/src/scss/index.scss`

The imported `.scss` file. We'll use this to test `HMR`.

```scss
body {
  background: red;
}
```

### 📄 `modules/web/assets/cp/webpack.config.js`

This file extends [Crafts default webpack configuration](https://github.com/craftcms/cms/blob/develop/packages/craftcms-webpack/index.js).

```js
/* jshint esversion: 6 */
/* globals module, require */

// Load the craftcms webpack config helper
const {getConfig} = require('@craftcms/webpack');

// Export config
module.exports = getConfig({
    // Set the context to the current directory
    context: __dirname,
    // Set the entry points relative to the context
    // `Asset` is the filename of the generated js / css files:
    //   - dist/Asset.js
    //   - dist/Asset.css
    config: {
        entry: {'Asset': './index.js'},
    }
});
```

::: warning
This file must be in the same directory as `Asset.php`.
:::

## Run Webpack

Let's test our setup and see if our js / scss builds:

```shell
cd modules/web/assets/cp
npx webpack --mode=development
```

If everything went to plan there should be new files in `modules/web/assets/cp/dist`:

Our tree now looks like:

```text
my-app/
├─ modules/
│  ├─ web/
│  │  └─ assets/
│  │     └─ cp/
│  │        ├─ dist/
│  │        │  ├─ css/
│  │        │  │  ├─ Asset.css
│  │        │  │  └─ Asset.css.map
│  │        │  ├─ Asset.js
│  │        │  ├─ Asset.js.LICENSE.txt
│  │        │  └─ Asset.jsmmap
│  │        ├─ src/
│  │        │  ├─ scss/
│  │        │  │  └─ index.scss
│  │        │  └─ index.js
│  │        ├─ .env
│  │        ├─ Asset.php
│  │        └─ webpack.config.js
│  └─ Module.php
└─ package.json
```

Visit the control panel and the background should be red.

## Hot Module Reloading using [webpack DevServer](https://webpack.js.org/configuration/dev-server/)

First check the `webpack DevServer` runs

```shell
# cd into the asset directory (if you're not already there)
$ cd modules/web/assets/cp
# fire up the dev server
$ npx webpack serve --mode=development
```

You should see something like:

```shell
<i> [webpack-dev-server] Project is running at:
<i> [webpack-dev-server] Loopback: http://localhost:8085/, http://127.0.0.1:8085/
<i> [webpack-dev-server] Content not from webpack is served from 'my-project/modules/web/assets/cp/src/templates, my-project/modules/web/assets/cp/dist' directory
```

Check the files are being served correctly. Visit:

```shell
open http://127.0.0.1:8085/Asset.js
open http://127.0.0.1:8085/css/Asset.css
```

There's a lot webpack cruft… that's because we're running the DevServer.

If you refresh the CraftCMS admin the red background will have disappeared.
That's because `npx webpack serve` empties the `modules/web/assets/cp/dist/` directory.

Let's fix that.

### Connect Craft to the dev-server

We added `modules/web/assets/cp/.env` to tell Craft about the dev server.

Add the following to the `.env` file (double check the domain and port)

```
DEV_SERVER_PUBLIC="http://localhost:8085"
DEV_SERVER_PORT="8085"
DEV_SERVER_LOOPBACK="http://127.0.0.1:8085"
```

Restart the DevServer and browse `http://127.0.0.1:8085/which-asset`

The browser should show:

```json
{
  "classes": [
    "modules\\web\\assets\\cp\\Asset"
  ],
  "context": "/usr/local/var/www/dev-diary.localhost/modules/web/assets/cp"
}
```

This url is used by Craft to check if the DevServer is running
and which Assets should be served by the DevServer.

Visit the Craft admin and the background should be red.

Update `modules/web/assets/cp/src/scss/index.scss`:

```scss
body {
  background: blue;
}
```

Hit save and the Craft admin background should be blue.

If it is then you've just setup Webpack w/ Hot Module Reloading!