import fp from 'fastify-plugin';
import authenticate from "../utils/authenticate.js";
async function authPlugin(app, opts) {
    app.decorate('authenticate', authenticate);
}
export default fp(authPlugin);
