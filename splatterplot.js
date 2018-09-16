/*
window.Splatter = {
    'Plot': require('./plot'),
    'Node': require('./node'),
    'NodeImage': require('./image-node')
};
//*/
var Snap = require('snapsvg');
var Emitter = require('extended-emitter');


function SplatterPlot(options){
    this.options = options || {};
    var size = this.options.size;
    var numShells = this.options.shells;
    var capacity = 0;
    this.shells = [];
    this.nodes = [];
    var shell;
    var shellNumber = 0;
    while((size && capacity <= size) || (numShells && numShells > this.shells.length)){
        shell = new SplatterShell({
            radius: this.options.radius,
            width: this.options.nodeX,
            height: this.options.nodeY,
            margin: this.options.margin,
            shell: shellNumber,
            offset: this.options.offset,
            spacing: this.options.spacing,
        });
        shellNumber++;
        shell.offset = capacity;
        capacity += shell.base;
        this.shells.push(shell);
    }
    (new Emitter()).onto(this);
    if(this.options.selector) this.attach(this.options.selector);
    var ob = this;
    Object.defineProperty(this, 'length', {
        get: function() {
            var result = 0;
            for(var lcv=0; lcv< ob.shells.length; lcv++){
                result += ob.shells[lcv].base;
            }
            return result;
        },
        enumerable: true,
        configurable: true
    });
}
SplatterPlot.prototype.randomPosition = function(type){
    if(type === 'shell'){
        var shell = Math.floor(this.shells.length*Math.random());
        var pos = Math.floor(this.shells[shell].base*Math.random());
        return this.shells[shell].offset+pos;
    }
    if(type === 'even'){
        return Math.floor(this.length*Math.random())
    }
};
SplatterPlot.prototype.attach = function(domNode){
    this.svg = Snap(domNode);
    var node = document.querySelector(domNode);
    var ob = this;
    window.addEventListener('resize', function(){
        var bbox = node.getBoundingClientRect();
        ob.options.x = Math.floor(bbox.width/2);
        ob.options.y = Math.floor(bbox.height/2);
    });
    var bbox = node.getBoundingClientRect();
    if(!this.options.x){
        this.options.x = Math.floor(bbox.width/2);
    }
    if(!this.options.y){
        this.options.y = Math.floor(bbox.height/2);
    }
    this.recalculate();
};
SplatterPlot.prototype.resizeTo = function(context){
    var ob = this;
    context.addEventListener('resize', function(){
        ob.container
    })
};
SplatterPlot.prototype.add = function(splatterNode){
    if(this.options.nodeX && !splatterNode.options.x){
        splatterNode.options.x = this.options.nodeX;
    }
    if(this.options.nodeY && !splatterNode.options.y){
        splatterNode.options.y = this.options.nodeY;
    }
    if(!(
        splatterNode.options.radius ||
        splatterNode.options.x ||
        splatterNode.options.y
    ) && this.options.radius) splatterNode.options.radius = this.options.radius;
    if(this.options.nonSequential){
        if(!this.numAdded) this.numAdded = 0;
        this.numAdded++;
        if(this.numAdded < this.length){
            var type = typeof this.options.nonSequential === 'string'?this.options.nonSequential:'even';
            var pos;
            var count = 0;
            while(pos === null || this.nodes[pos]){
                pos = this.randomPosition(type);
                count++;
                if(count > 200) throw new Error('couldn\'t find a spot.');
                console.log(pos);
            }
            console.log('pos', pos, splatterNode, this.nodes.length);
            this.nodes[pos] = splatterNode;
        }
    }else{
        this.nodes.push(splatterNode);
    }
    var node = splatterNode.create(this.svg);
    this.scheduleUpdate();
};
SplatterPlot.prototype.shellAt = function(position){
    var capacity = 0;
    var shell;
    for(var lcv=0; lcv< this.shells.length; lcv++){
        shell = this.shells[lcv];
        capacity += shell.base;
        if(capacity > position) return shell;
    }
    return null;
};
SplatterPlot.prototype.scheduleUpdate = function(){
    if(this._updateScheduled) return;
    var ob = this;
    ob._updateScheduled = setTimeout(function(){
        ob.recalculate();
        delete ob._updateScheduled;
    }, 1);

};
SplatterPlot.prototype.recalculate = function(){
    var ob = this;
    this.nodes.forEach(function(node, pos){
        var shell = ob.shellAt(pos);
        if(!shell) return console.log('no more space in shells!');
        var shellPos = pos - shell.offset;
        var x = ob.options.nodeX || ob.options.radius || 0;
        var y = ob.options.nodeY || ob.options.radius || 0;
        node.position = shell.position(shellPos);
        node.position.x = node.position.x + ob.options.x;
        node.position.y = node.position.y + ob.options.y;
        node.update(node.position);
    });
};

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
};

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
        this.container.transform(translate);
    }
};

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

window.Splatter = {
    'Plot': SplatterPlot,
    'Node': SplatterNode,
    'ShapeNode' : SplatterShapeNode,
    'ImageNode' : SplatterImageNode
};
