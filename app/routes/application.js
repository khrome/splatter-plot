import Route from '@ember/routing/route';
import appLayout from '@polymer/app-layout';
import ironIcons from '@polymer/iron-icons';
import paperIconButton from '@polymer/paper-icon-button';
import exPanda from 'ex-panda';

export default Route.extend({
    model : function(params){
        return new Promise(function(resolve){
            var origin = 2020;
            var year = (new Date()).getFullYear();
            resolve({ range : year === origin?year:origin+'-'+year });
        });
    }
});
