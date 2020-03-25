const { Component } = require("@serverless/core");
const cloudflare = require("cloudflare");

class CloudflareRoute extends Component {
  async default(inputs = {}) {
    const EMAIL = process.env.CF_EMAIL;
    const API_KEY = process.env.CF_KEY;
    const { routePatternPostfix, workerName} = inputs;
    this.context.debug(`Starting CloudflareRoute Component.`);
    this.context.debug(`Finding DNS zone`);
    const cf = cloudflare({ email:EMAIL, key:API_KEY });
    const zones = await cf.zones.browse();
    const { id } = zones.result.find( zoneObj => zoneObj.name === zone);
    id && (this.state.zoneId = id);
    
    if (!this.state.zoneId) {
      throw new Error(`"${zone}" not found`);
    }

    const routePattern = `${recordName}${routePatternPostfix}`;  
    const routes = await cf.enterpriseZoneWorkersRoutes.browse(this.state.zoneId);
    const route = routes.result.find( route => route.pattern === routePattern);    
    this.state.routeId = route && route.id; 
    console.log("route 1", route);

    if (!this.state.routeId) {
      this.context.debug(`Creating route : ${routePattern}`);
      const route = await cf.enterpriseZoneWorkersRoutes.add(this.state.zoneId, {
        pattern:routePattern,
        script:workerName
      });
      route && (this.state.routeId = route.result.id);
      console.log("route 2", route);
    } 
    else {
      const { result } = await cf.enterpriseZoneWorkersRoutes.read( this.state.zoneId, this.state.routeId );
      console.log("route 3", result);
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
    this.context.debug(`Removing DNS Record`);
    const cf = cloudflare({ email:EMAIL, key:API_KEY });
    if (!this.state.zoneId) {
      throw new Error(`No zone found`);
    }    
    if (!this.state.recordId) {
      throw new Error(`No record found`);
    }

    await cf.dnsRecords.del(this.state.zoneId, this.state.recordId);
    delete this.state.zoneId;
    delete this.state.recordId;
    await this.save();
    return {};
  }
}
module.exports = CloudflareDNS;
