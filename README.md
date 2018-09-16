splatter-plot
=============
![logo](images/logo.png)

Layout concentric rings of things( See [demo](https://khrome.github.io/splatter-plot/) ). The old MooTools version is [here](https://mootools.net/forge/p/splatterplot).

It supports direct linking to the classes through UMD as well as bundling via browserify and webpack.

Webpack/Browserify Example
--------------------------

```js
    var Splatter = require('splatter-plot');
    var plot = new Splatter.Plot({
        selector: '#some_dom_id',
        shells: 5,   // # of circles
        radius: 50,  // the radius of each node on the circle
        offset: 10,  // how much is shell is rotated
        spacing: 30, // the amount of space between each circle
        margin: 20   // the spacing around each node
        nonSequential : 'shell' //whether to distriute nodes randomly
        // ('shell', 'even' or absent)
    });
    //add an image
    plot.add(new Splatter.ImageNode({
        src : 'path/to/my.png'
    });
    //draw a shape(star)
    plot.add(new Splatter.ShapeNode({
        path : "M 46,51 L 31,42 L 17,51 L 22,35 L 8,24 L 25,23 L 31,7 "+
               "L 38,23 L 55,24 L 41,35 L 46,51 z"
    }));
```

Testing
-------
For now it's just opening `index.html` in your browser. Real tests will come soon.

Enjoy,

- Abbey Hawk Sparrow
