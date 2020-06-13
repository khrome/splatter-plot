import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('demo-one', {path:'/'});
  this.route('demo-two');
  this.route('demo-three');
  this.route('demo-four');
});

export default Router;
