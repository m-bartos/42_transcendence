import type {FastifyInstance, FastifyPluginOptions} from 'fastify'
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import AutoLoad from '@fastify/autoload';
import schemasPlugin from "./schemas/schemasPlugin.js";
const options = {};
export default async function app (fastify: FastifyInstance, opts: FastifyPluginOptions){

    const __dirname:string = dirname(fileURLToPath(import.meta.url));


    await fastify.register(schemasPlugin);
    await fastify.register(AutoLoad, {
        dir: join(__dirname, 'plugins'),
        options: Object.assign({}, opts)
    });

}
export {options};