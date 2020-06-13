import Route from '@ember/routing/route';
import Splatter from 'splatter-plot';

export default Route.extend({
    model : function(){
        var ob = this;
        window.transitionTo = function(l){ ob.transitionTo(l) };
        setTimeout(function(){
            var plot2 = new Splatter.Plot({
                selector: '#panel_two',
                shells: 5,
                radius: 50,
                offset: 10,
                spacing: 30,
                margin: 20
            });
            var images = [
                "images/ladmo.png",
                "images/dobbs.png",
                "images/turtles.png"
            ];
            for(var lcv=0; lcv< plot2.length; lcv++){
                plot2.add(new Splatter.ImageNode({
                    src :images[Math.floor(Math.random()*images.length)]
                }));
            }
        }, 100);
        return new Promise(function(resolve){
            resolve({});
        });
    }
});
