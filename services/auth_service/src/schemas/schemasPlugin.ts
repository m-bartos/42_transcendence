import schemas from '../schemas/schemas.js'
import {FastifyInstance, FastifyPluginOptions} from "fastify";
import fp from 'fastify-plugin'

async function schemaPlugin(fastify: FastifyInstance, options:FastifyPluginOptions) {
    Object.values(schemas).forEach((schema) => {
        fastify.addSchema(schema);
    })
}

export default fp(schemaPlugin)