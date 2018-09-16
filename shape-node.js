(function (root, factory){
    if(typeof define === 'function' && define.amd){//AMD
        define(['./node', 'snapsvg'], factory);
    }else if (typeof module === 'object' && module.exports){ //CommonJS/Node
        module.exports = factory(require('./node'), require('snapsvg'));
    }else{ //Globals
        root.SplatterPlotShapeNode = factory(root.SplatterPlotNode, root.Snap);
    }
}(typeof self !== 'undefined' ? self : this, function(SplatterNode, Snap){
    function SplatterShapeNode(options){
        SplatterNode.apply(this, arguments);
    }
    SplatterShapeNode.prototype.create = function(svg){
        var size = (this.options.radius && this.options.radius*2) ||
            Math.max(this.options.width, this.options.height) ||
            Math.max(this.options.x, this.options.y) ||
            20;
        SplatterNode.prototype.create.apply(this, arguments);
        if(this.options.path){
            this.foreground = svg.path(this.options.path);
            var bbox = this.foreground.getBBox();
            this.foregroundEffect = Snap.matrix().scale(
                size / Math.max(bbox.width, bbox.height)
            );
            this.foreground.transform(this.foregroundEffect);
            this.container = svg.g();
            this.container.add(this.foreground)
        }
    };

    SplatterShapeNode.prototype.update = function(options){
        SplatterNode.prototype.update.apply(this, arguments);
        if(options && options.x && options.y && this.foreground){
            var bbox = this.container.getBBox();
            //normalize bounds to ul -> 0,0
            var normalOffsetX = -1*bbox.x;
            var normalOffsetY = -1*bbox.y;
            var translate = Snap.matrix().translate(
                options.x-(bbox.width/2)+normalOffsetX,
                options.y-(bbox.height/2)+normalOffsetY
            );
            if(this.options.animate){
                var duration = (typeof this.options.animate === 'number')?
                    this.options.animate:
                    this.options.animate.duration;
                var easing = this.options.animate.easing || mina.linear
                var ob = this;
                this.container.animate({transform: translate}, duration, easing, function(){
                    if(ob.events) ob.events.emit('ready', ob);
                });
            }else{
                this.container.attr({transform: translate});
                if(this.events) this.events.emit('ready', ob);
            }
        }
    };
    return SplatterShapeNode;
}));
