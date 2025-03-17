import bcrypt from 'bcryptjs'
import fp from 'fastify-plugin'
import {FastifyInstance, FastifyPluginOptions} from "fastify";

export default fp(async function (fastify: FastifyInstance, opts: FastifyPluginOptions){
    const saltRounds: number = 10;

    async function hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(saltRounds);
        return await bcrypt.hash(password, salt);
    }

    async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }

    fastify.decorate('hashPassword', hashPassword);
    fastify.decorate('comparePassword', comparePassword);
})