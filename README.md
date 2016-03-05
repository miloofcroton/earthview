# earthview
Experience a beautiful image from Google Earth every time you open a new tab.


The official version [Earth View from Google Earth](https://chrome.google.com/webstore/detail/earth-view-from-google-ea/bhloflhklmhfpedakmangadcdofhnnoh) based on Object.observe, and it stopped working in the latest update to Canary.

Object.observe polyfill based on [EcmaScript 7 spec](http://arv.github.io/ecmascript-object-observe/). 
In November Object.observe proposal was withdrawn from TC39.

Although it may still work in old Chrome browsers, but it had removed at Chrome Canary version 51.0.2668.0 canary (64-bit). So I add Object.observe polyfill for it.
