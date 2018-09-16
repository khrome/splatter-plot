(function (root, factory){
    if(typeof define === 'function' && define.amd){//AMD
        define(['async', 'extended-emitter', 'snapsvg', './shell'], factory);
    }else if (typeof module === 'object' && module.exports){ //CommonJS/Node
        module.exports = factory(
            require('async'),
            require('extended-emitter'),
            require('snapsvg'),
            require('./shell')
        );
    }else{ //Globals
        root.SplatterPlot = factory(root.async, root.ExtendedEmitter, root.Snap, root.SplatterShell);
    }
}(typeof self !== 'undefined' ? self : this, function(asynk, Emitter, Snap, SplatterShell){
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
        (this.events = new Emitter()).onto(this);
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
        if((!splatterNode.options.animation) && this.options.animation){
            splatterNode.options.animation = this.options.animation;
        }
        if(!(
            splatterNode.options.radius ||
            splatterNode.options.x ||
            splatterNode.options.y
        ) && this.options.radius) splatterNode.options.radius = this.options.radius;
        splatterNode.events = this.events;
        var pos;
        if(this.options.nonSequential){
            if(!this.numAdded) this.numAdded = 0;
            this.numAdded++;
            if(this.numAdded < this.length){
                var type = typeof this.options.nonSequential === 'string'?this.options.nonSequential:'even';
                var count = 0;
                pos = null;
                while(pos === null || this.nodes[pos]){
                    pos = this.randomPosition(type);
                    count++;
                    if(count > 200) throw new Error('couldn\'t find a spot.');
                }
                this.nodes[pos] = splatterNode;
            }
        }else{
            pos = this.nodes.length;
            this.nodes.push(splatterNode);
        }
        var node = splatterNode.create(this.svg);
        splatterNode.position = this.options.origin || this.calculate(pos, splatterNode)
        splatterNode.update(splatterNode.position);
        if(this.options.origin) this.scheduleUpdate();
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
            ob.recalculate(function(){
                delete ob._updateScheduled;
            });
        }, 1);

    };
    SplatterPlot.prototype.calculate = function(pos, node, currentShell){
        var shell = currentShell || this.shellAt(pos);
        if(!shell) return console.log('no more space in shells!');
        var shellPos = pos - shell.offset;
        var x = this.options.nodeX || this.options.radius || 0;
        var y = this.options.nodeY || this.options.radius || 0;
        node.position = shell.position(shellPos);
        var result = {};
        result.x = node.position.x + this.options.x;
        result.y = node.position.y + this.options.y;
        return result;
    }
    SplatterPlot.prototype.recalculate = function(cb){
        var ob = this;
        //switch to shellByShell
        asynk.eachOfSeries(this.nodes, function(node, pos, done){
            if(!node) return done();
            node.position = ob.calculate(pos, node)
            node.update(node.position);
            done();
        }, cb);
    };
    return SplatterPlot;
}));
