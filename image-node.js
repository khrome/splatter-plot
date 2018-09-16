(function (root, factory){
    if(typeof define === 'function' && define.amd){//AMD
        define(['./node', 'snapsvg'], factory);
    }else if (typeof module === 'object' && module.exports){ //CommonJS/Node
        module.exports = factory(require('./node'), require('snapsvg'));
    }else{ //Globals
        root.SplatterPlotShapeNode = factory(root.SplatterPlotNode, root.Snap);
    }
}(typeof self !== 'undefined' ? self : this, function(SplatterNode, Snap){
    function SplatterImageNode(options){
        SplatterNode.apply(this, arguments);
    }
    SplatterImageNode.prototype.create = function(svg){
        var size = (this.options.radius && this.options.radius*2) ||
            Math.max(this.options.width, this.options.height) ||
            Math.max(this.options.x, this.options.y) ||
            20;
        SplatterNode.prototype.create.apply(this, arguments);
        if(this.options.src){
            this.foreground = svg.image(this.options.src ,0,0,size,size)
            var bbox = this.foreground.getBBox();
            this.container = svg.g();
            this.container.add(this.foreground);
        }
    };

    SplatterImageNode.prototype.update = function(options){
        SplatterNode.prototype.update.apply(this, arguments);
        if(options && options.x && options.y && this.foreground){
            var bbox = this.container.getBBox();
            var translate = Snap.matrix().translate(
                options.x-(bbox.width/2),
                options.y-(bbox.height/2)
            );
            this.container.transform(translate);
        }
    };
    return SplatterImageNode;
}));
