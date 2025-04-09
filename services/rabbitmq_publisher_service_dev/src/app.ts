import type {FastifyInstance, FastifyPluginOptions} from 'fastify'
//import schemasPlugin from "./schemas/schemasPlugin.js";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import AutoLoad from '@fastify/autoload';
const options = {};
export default async function app (fastify: FastifyInstance, opts: FastifyPluginOptions){

    const __dirname:string = dirname(fileURLToPath(import.meta.url));

    //await fastify.register(schemasPlugin);

    await fastify.register(AutoLoad, {
        dir: join(__dirname, 'plugins'),
        options: Object.assign({}, opts)
    });

}
export {options};

