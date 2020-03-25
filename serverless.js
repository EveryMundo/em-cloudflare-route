const { Component } = require("@serverless/core");
const cloudflare = require("cloudflare");

class CloudflareRoute extends Component {
  async default(inputs = {}) {
    const EMAIL = process.env.CF_EMAIL;
    const API_KEY = process.env.CF_KEY;
    const { routePattern, workerName, zone } = inputs;

    this.context.debug(`Starting CloudflareRoute Component.`);
    this.context.debug(`Finding DNS zone`);
    const cf = cloudflare({ email:EMAIL, key:API_KEY });
    const zones = await cf.zones.browse();
    const { id } = zones.result.find( zoneObj => zoneObj.name === zone);
    id && (this.state.zoneId = id);
    
    if (!this.state.zoneId) {
      throw new Error(`"${zone}" not found`);
    }
   
    const routes = await cf.enterpriseZoneWorkersRoutes.browse(this.state.zoneId);
    const route = routes.result.find( route => route.pattern === routePattern);    
    this.state.routeId = route && route.id;   
    if (!this.state.routeId) {
      this.context.debug(`Creating route : ${routePattern}`);
      const route = await cf.enterpriseZoneWorkersRoutes.add(this.state.zoneId, {
        pattern:routePattern,
        script:workerName
      });
      route && (this.state.routeId = route.result.id);    
    } 
    else {
      const { result } = await cf.enterpriseZoneWorkersRoutes.read( this.state.zoneId, this.state.routeId );
      if (result.pattern === routePattern && result.script === workerName)
      {
        this.context.debug(`Skipping unchanged route: ${routePattern}`);        
      } else {
        this.context.debug(`Updating route: ${routePattern}`);
        await cf.enterpriseZoneWorkersRoutes.edit(this.state.zoneId, this.state.routeId, {
          pattern:routePattern,
          script:workerName      
        });
      }      
    }   

    await this.save();    
    return { routePattern };
  };

  async remove() {
    const EMAIL = process.env.CF_EMAIL;
    const API_KEY = process.env.CF_KEY;
    this.context.debug(`Removing route`);
    const cf = cloudflare({ email:EMAIL, key:API_KEY });
    if (!this.state.zoneId) {
      throw new Error(`No zone found`);
    }    
    if (!this.state.routeId) {
      throw new Error(`No route found`);
    }

    await cf.enterpriseZoneWorkersRoutes.del(this.state.zoneId, this.state.routeId);
    delete this.state.routeId;
    await this.save();
    return {};
  }
}
module.exports = CloudflareRoute;
