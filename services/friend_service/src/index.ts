import fastify from 'fastify';

const app = fastify({logger: true});

app.get("/", async (req, res) => {
    res.code(200);
    return {service: "FriendService"};
})

await app.listen({port: 3000, host: "0.0.0.0"});


try
{
    await app.ready()
    console.log("Fastify is ready.");
}
catch(err) {
    console.log("Fastify encountered an error: ",err);
}

