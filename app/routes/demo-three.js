import Route from '@ember/routing/route';
import Splatter from 'splatter-plot';

export default Route.extend({
    model : function(){
        var ob = this;
        window.transitionTo = function(l){ ob.transitionTo(l) };
        setTimeout(function(){
            var plot3 = new Splatter.Plot({
                selector: '#panel_three',
                shells: 25,
                radius: 5,
                offset: 10,
                spacing: 10,
                margin: 5,
                nonSequential : 'shell'
            });
            for(var lcv=0; lcv< plot3.length/10; lcv++){
                plot3.add(new Splatter.ShapeNode({
                    path : "M 46,51 L 31,42 L 17,51 L 22,35 L 8,24 L 25,23 L 31,7 L 38,23 L 55,24 L 41,35 L 46,51 z"
                }));
            }
        }, 100);
        return new Promise(function(resolve){
            resolve({});
        });
    }
});
