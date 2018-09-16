(function (root, factory){
    if(typeof define === 'function' && define.amd){//AMD
        define([], factory);
    }else if (typeof module === 'object' && module.exports){ //CommonJS/Node
        module.exports = factory();
    }else{ //Globals
        root.SplatterPlotNode = factory();
    }
}(typeof self !== 'undefined' ? self : this, function(){
    function SplatterNode(options){
        this.options = typeof options == 'string'?{path:options}:options;
    }

    SplatterNode.prototype.update = function(options){
        if(options && options.x && options.y){
            this.background.attr({
                cx: options.x,
                cy: options.y
            });
        }
    };

    SplatterNode.prototype.create = function(svg){
        var size = (this.options.radius && this.options.radius*2) ||
            Math.max(this.options.width, this.options.height) ||
            Math.max(this.options.x, this.options.y) ||
            20;
        this.background = svg.circle(0, 0, size/2);
        var ob = this;
        setTimeout(function(){
            ob.update({x:Math.floor(svg.width/2), y:Math.floor(svg.height/2)});
        },0);
    };
    return SplatterNode;
}));
