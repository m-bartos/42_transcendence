import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import AutoLoad from '@fastify/autoload';
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

import wsRoutes from './routes/ws-routes.js'

const options = {};
export default async function app (fastify: FastifyInstance, opts: FastifyPluginOptions){

    const __dirname:string = dirname(fileURLToPath(import.meta.url));

    await fastify.register(AutoLoad, {
        dir: join(__dirname, 'plugins'),
        options: Object.assign({}, opts)
    });

    // TODO: WHY THE AUTOLOAD IS NOT LOADING ws-routes??
    await fastify.register(AutoLoad, {
        dir: join(__dirname, 'routes'),
        indexPattern: /.*-routes(\.js)$/i,
        ignorePattern: /.*\.js/,
        options: Object.assign({}, opts)
    });

    // loading wsRoutes manually
    await fastify.register(wsRoutes);

}

export {options};

