const Hapi = require('@hapi/hapi');

const init = async () => {
    const server = Hapi.server({
        port: 8005,
        host: 'localhost',
    });

    await server.start();
    console.log(`Bookshelf API running at ${server.info.uri}`);
}

init();
