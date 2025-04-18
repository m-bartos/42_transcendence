import {FastifyInstance, FastifyPluginOptions} from "fastify";
import fp from 'fastify-plugin';
import { schemas } from "../schemas/schemas.js";

async function schemaPlugin(fastify: FastifyInstance, opts: FastifyPluginOptions): Promise<void> {
    for (const schema of schemas) {
        fastify.addSchema(schema);
    }
}

export default fp(schemaPlugin)