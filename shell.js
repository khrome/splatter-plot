(function (root, factory){
    if(typeof define === 'function' && define.amd){//AMD
        define([], factory);
    }else if (typeof module === 'object' && module.exports){ //CommonJS/Node
        module.exports = factory();
    }else{ //Globals
        root.SplatterPlot = factory();
    }
}(typeof self !== 'undefined' ? self : this, function(){
    var computeRadiusForShell = function(
        shell_pos, w, h, margin, spacing, expansionFactor
    ){
        //init for 0
        var radius = Math.sqrt(w*w + h*h)*(expansionFactor/2);
        //do the rest
        if(shell_pos >= 1) for(var lcv=1; lcv <= shell_pos; lcv++){
            radius += Math.sqrt(w*w + h*h)*expansionFactor + margin + spacing;
        }
        return radius;
    };
    var computeBaseForShell = function(
        shell_pos, w, h, margin, spacing, expansionFactor, radius
    ){
        //init for 0
        var circumference = Math.PI*radius*2;
        var hw_average = (w + h); // 1/2 for avg, 1/2 for diam -> radius
        var distance = margin + hw_average;
        return Math.floor(circumference/distance);
    };

    function SplatterShell(options){ // shellNumber, radius
        this.options = options || {};
        var w = this.options.width || this.options.radius || this.options.height;
        var h = this.options.height || this.options.radius || this.options.width;
        var s = this.options.shell || 0;
        var x = this.options.expansionFactor || 1.5;
        var m = (this.options.margin || 0);
        var p = (this.options.spacing || 0);
        this.offset = this.options.offset || 0;
        this.radius = computeRadiusForShell(s, w, h, m, p, x);
        this.base = computeBaseForShell(s, w, h, m, p, x, this.radius);
        if(this.options.debug) this.debugMode = true;
    }

    // outputs position relative to origin
    SplatterShell.prototype.position = function(seriesNumber){
        if(seriesNumber >= this.base) throw new Error('Out of Range');
        var itemInterval = (2*Math.PI)/this.base;
        var offset = this.offset == 0?0:(2*Math.PI)/this.offset;
        var lcv = seriesNumber;
        var x = this.radius * Math.cos(offset + lcv * itemInterval);
        var y = this.radius * Math.sin(offset + lcv * itemInterval);
        if(this.debugMode) console.log(
            "radius = "+this.radius+
            //"\ngroup = "+group+
            "\nbase = "+this.base+
            //"\nfloor = "+floor+
            "\ninterval = "+itemInterval+
            "\nlcv = "+lcv+
            "\nx = "+x+
            "\ny = "+y+
            "\nposition = "+seriesNumber
        );
        var coordinates = { 'x':Math.floor(x), 'y':Math.floor(y)};
        return coordinates;
    };

    SplatterShell.prototype.random = function(interval, returnInteger){
        return returnInteger?
            Math.floor(Math.random()*interval):
            (Math.random()*interval);
    };
    return SplatterShell;
}));
