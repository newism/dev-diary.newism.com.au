---
title: User profile urls in CraftCMS
date: 2023-08-23
author: Leevi Graham
gravatar: d613d2145633372c632e1a02a49657e0
twitter: '@leevigraham'
---

Unlike `Entries` and `Categories`, `Users` don't have a `URI Format` setting. This means <span v-pre>`{{ user.getUrl() }}`</span> method returns a blank string. Here's how to fix that in CraftCMS v4.3.0.

---

::: info
This article assumes you're using CraftCMS v4.3.0 or later.
:::

CraftCMS entries (and categories) have a setting called [`URI Format`](https://craftcms.com/docs/4.x/entries.html#entry-uri-formats).
This allows you to easily call <span v-pre>`{{ entry.getUrl() }}`</span> in your templates.

`Users` do not have this setting which requires developers to add custom url code in their templates. Usually something like:

```twig
{{ url("users/"~user.username) }}
```

This is fine but it's not ideal. It's also not very flexible. What if you want to change the url format? You'll need to update all your templates.

## Adding a `.url()` method to Users

First thing you might try is adding a [custom behaviour](https://craftcms.com/docs/4.x/extend/behaviors.html) to Users with a `getUrl()` method.
Unfortunately this won't work because `User` is an `Element` and `Element`'s already have a `getUrl()` method which can't be overwritten in a `Behaviour`.

::: info
If you're using CraftCMS < v4.3.0 you could still use a behaviour and add a `getProfileUrl()` method.
:::

Looking at the `Element::getUrl()` ([committed on Oct 21, 2022](https://github.com/craftcms/cms/commit/4e5f62cd08bd61c27d973437331e893e3a11610f)) method we can see there is a `User::EVENT_DEFINE_URL` event that is fired before the url is returned. We can use this to add our own logic.

## Create a module

Step 1: Follow the instructions on the [CraftCMS website](https://craftcms.com/docs/4.x/extend/module-guide.html) to create a custom module.

Step 2: Add the following code to your module's `init()` method:

```php
<?php
namespace foo;

use Craft;

class Module extends \yii\base\Module
{
    public function init()
    {
        // ...

        // Defer most setup tasks until Craft is fully initialized:
        Craft::$app->onInit(function() {
            // Add the event listener
             \craft\base\Event::on(
                User::class, 
                Element::EVENT_DEFINE_URL, 
                function (DefineUrlEvent $event) {
                    $event->handled = true;
                    // Add your custom url logic here
                    $event->url = UrlHelper::siteUrl('users/' . $event->sender->id);
                    // Other examples:
                    // $event->url = UrlHelper::siteUrl('users/' . $event->sender->username);
                    // $event->url = UrlHelper::siteUrl('users/' . $event->sender->uuid);
                }
            );
        });
    }
}
```

Step 3: Test it out by adding the following to your template:

```twig
{{ user.getUrl() }}
```






