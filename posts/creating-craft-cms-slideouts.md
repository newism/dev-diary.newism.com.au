---
title: How to add a slideout panel to your Craft CMS module or plugin
date: 2022-04-14
author: Leevi Graham
gravatar: d613d2145633372c632e1a02a49657e0
twitter: '@leevigraham'
---

Craft CMS 3.7 added element editor slideouts. I'm going to show you how to add slideouts to your own module or plugin. 

---

## Setup Craft

To get started you'll need:

1. A Craft CMS v3.7.22+ install (also tested in Craft CMS v4.0.0)
2. A custom module or plugin.

## Create a Module

[Create a module following the Craft CMS docs](https://craftcms.com/docs/4.x/extend/module-guide.html#preparation).


Important: Double check that the [module template root](https://craftcms.com/docs/4.x/extend/template-roots.html#plugin-control-panel-templates)
is registered in your module's `init` method:

```php
// Register Template Roots
Event::on(
    View::class,
    View::EVENT_REGISTER_CP_TEMPLATE_ROOTS,
    function(RegisterTemplateRootsEvent $event) {
        $event->roots[$this->id] = __DIR__ . '/templates';
    }
);
```


## Create an Asset Bundle

[Create an `Asset Bundle` following the Craft CMS docs](https://craftcms.com/docs/4.x/extend/asset-bundles.html).

## Create a Control Panel Controller

If you're unfamiliar with `Controllers` [read the Craft CMS docs first](https://craftcms.com/docs/4.x/extend/controllers.html).

We're going to create a new `SlideoutController` that will be responsible for:

1. Displaying the button to trigger the slideout
2. Displaying the slideout content
3. Processing the form submission in the slideout and returning data back to the element that triggered the slideout

Create the new `SlideoutController` folders / files by running the following in your console or create them manually.

```shell
mkdir -p modules/controllers
touch modules/controllers/SlideoutController.php
```

Add an `actionIndex` method to the `SlideoutController.php` to render a control panel template with the following code:

```php
<?php

namespace modules\controllers;

use craft\web\Controller;
use yii\web\Response;

class SlideoutController extends Controller
{
    public function actionIndex(): Response
    {
        return $this->asCpScreen()
            ->title('Slideout Controller')
            ->contentTemplate(
                'my-module/slideout/index.twig'
            );
    }
}
```

Create the template that's rendered in the `indexAction`.

Run the following commands in your console or create the folder / file manually.

```shell
mkdir -p modules/templates/slideout
touch modules/templates/slideout/index.twig
```

Edit `modules/templates/slideout/index.twig` add:

```twig
{{ _self }}
```

Test the `SlideoutController:actionIndex` renders. Visit: `https://your-site.com/admin?action=my-module/slideout/index`
and you should see: `my-module/slideout/index.twig`

![Screenshot of the slideout controller template](/images/creating-craft-cms-slideouts/slideout-controller-cp-controller-1.png)

## Trigger the slideout

To trigger a slideout there's a few steps:

1. Create a new javascript widget in the `AssetBundle`
2. Load the `AssetBundle` in our CP screen
3. Add a button to our CP screen to trigger the slideout
4. Create the slideout content action and template
5. Test the Trigger Slideout button

### Create a new javascript widget in the `AssetBundle`

The following javascript uses Craft's Garnish base class which is pretty much undocumented.
[Here's some other resources](https://straightupcraft.com/articles/getting-started-with-javascript-in-craft-cms)
including a 2 hour hangout with Brandon Kelly walking through Craft's javascript.

Add the following javascript to your `AssetBundle` `script.js`:

```js
(function ($) {
    // Create a new object on the window we can call from our template
    window.MyModuleSlideoutTrigger = Garnish.Base.extend({
        // Called when a new widget is created
        init: function (elementId) {
            // Find the trigger element
            this.$triggerElement = $('#' + elementId);
            // Attach an onclick handler
            this.$triggerElement.on('click', $.proxy(this, 'onClick'));
        },
        onClick: function () {
            // Create a new slideout populated with content from a CP Screen action
            // The Craft.CpScreenSlideout argument is a controller action string
            const slideout = new Craft.CpScreenSlideout('my-module/slideout/content');
            // Open the slideout
            slideout.open();
            // Listen fro the submit event
            slideout.on('submit', function (e) {
                alert(JSON.stringify(e.response.data));
            })
        },
    });
})(jQuery);
```

### Load the `AssetBundle` in our CP Screen

In the in the `SlideoutController::indexAction` add:

```php
Craft::$app->getView()->registerAssetBundle(Asset::class);
```

Your controller should now look like:

```php
<?php

namespace modules\controllers;

use Craft;
use craft\web\Controller;
use modules\web\assets\cp\Asset;
use yii\web\Response;

class SlideoutController extends Controller
{
    public function actionIndex(): Response
    {
        Craft::$app->getView()->registerAssetBundle(Asset::class);
        
        return $this->asCpScreen()
            ->title('Slideout Controller')
            ->contentTemplate(
                'my-module/slideout/index.twig'
            );
    }
}    
```

### Add a button to our CP screen to trigger the slideout

Edit `modules/templates/slideout/index.twig` add a button and initialise the widget:

```twig
<button type="button" id="slideout-trigger" class="btn">
    Trigger Slideout
</button>

{!-- Create a new widget instance and pass through the button ID --}
{% js %}
    new MyModuleSlideoutTrigger('slideout-trigger');
{% endjs %}
```

Refresh the control panel and you should see:

![Screenshot of the slideout controller template](/images/creating-craft-cms-slideouts/slideout-controller-cp-controller-2.png)

### Create the `SlideoutController::actionContent` controller and template

Our javascript widget creates a new `CpScreenSlideout` which loads it's content from a CP action so we need to create the new action and content template.

In the in the `SlideoutController` add the new action code:

```php
// Action: my-module/slideout/content
public function actionContent(): Response
{
    // The slideout submits back to this action
    // so check if it's a post and respond with a success
    if($this->request->isPost) {
        return $this->asSuccess('success');
    }
    
    // Return the slideout content in a <form>
    // The form action points back to this controller action
    return $this->asCpScreen()
        ->action('my-module/slideout/content')
        ->title('Slideout Content')
        // Render the content template
        ->contentTemplate(
            'my-module/slideout/content.twig'
        );
}
```

Create the template that's rendered in the `SlideoutController::contentAction`.
Run the following commands in your console or create the folder / file manually.

```shell
mkdir -p modules/templates/slideout
touch modules/templates/slideout/content.twig
```

Edit `modules/templates/slideout/content.twig` add:

```twig
{{ _self }}
```

#### Test the `SlideoutController:actionContent` renders.

Visit: `https://your-site.com/admin?action=my-module/slideout/index`
and you should see a Save button and `my-module/slideout/content.twig`

![](/images/creating-craft-cms-slideouts/slideout-controller-cp-content-1.png)

Great… nearly there.

### Test the Trigger Slideout button

Visit: `https://your-site.com/admin?action=my-module/slideout/index`
and click the "Trigger Slideout" button.

If everything works as expected you should see:

![](/images/creating-craft-cms-slideouts/slideout-controller-trigger-slideout.gif)

## Wrapping Up

Craft CMS Slideout panels provide another tool in your module UI toolbelt.

I've shown you how to implement a `Craft.CpScreenSlideout` 
but there's also [`Craft.Slideout`](https://github.com/craftcms/cms/blob/develop/src/web/assets/cp/src/js/Slideout.js) (the base class) 
and [`ElementEditorSlideout`](https://github.com/craftcms/cms/blob/develop/src/web/assets/cp/src/js/ElementEditorSlideout.js)
which extends `Craft.CpScreenSlideout` for editing elements.