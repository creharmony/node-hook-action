import crypto from 'crypto';
import {expect, should, use} from "chai";
import {default as chaiHttp, request} from "chai-http";
import {createRequire} from 'module';

should();
use(chaiHttp);

const enableAsyncTests = process.env.ENABLE_ASYNC_TESTS;

let hookServer;
let server;
let agent = null;
let asyncTaskId;

describe('Server Webhooks Tests', function () {

    before(async function () {
        const require = createRequire(import.meta.url);
        const packageJson = require('../package.json');
        // DEBUG // console.log(`packageJson.main: ${packageJson.main}`)
        const mainClass = "../" + packageJson.main;
        const {WebhookServerLauncher} = await import(mainClass);
        // DEBUG // console.log(`launching ${mainClass}`)
        try {
            hookServer = await WebhookServerLauncher.launch();
            server = hookServer.listeningServer;
            agent = request.agent(server)
        } catch (err) {
            console.error(err);
            throw err;
        }
    });

    after(function () {
        try {
            server.close();
        } catch (exception) {
            expect.fail(exception);
        }
    });
    it('should post custom webHook with simpleSecret', async function () {
        const res = await agent.post('/webhook')
            .set('x-token', 'customFlatSecret')
            .send({customJson: 'content'});
        expect(res).to.have.status(200);
        expect(res.body.code).to.equal("OK");
    });
    it('should post github webHook', async function () {
        const body = {repository: {name: 'node-hook-action'}};
        const calcSecret = "sha1=" + crypto.createHmac("sha1", "githubSecretHere")
            .update(JSON.stringify(body))
            .digest("hex");

        const res = await agent.post('/webhook')
            .set('X-GitHub-Event', 'push')
            .set('X-Hub-Signature', calcSecret)
            .send(body);
        expect(res).to.have.status(200);
        expect(res.body.code).to.equal("OK");
    });
    if (enableAsyncTests === 'true') {
        it('should post custom async webHook with simpleSecret', async function () {
            const res = await agent.post('/webhook')
                .set('x-token', 'customFlatSecret')
                .set('x-try', 'asyncSample')
                .send();
            expect(res).to.have.status(201);
            expect(res.headers.location).to.exist;
            expect(res.body.code).to.equal("CREATED");
            expect(res.body.eventType).to.equal("custom");
            expect(res.body.actionId).to.exist;
            asyncTaskId = res.body.actionId;
        });
        it('should get hook actions', async function () {
            await new Promise(resolve => setTimeout(resolve, 500));
            const res = await agent.get('/webhook/actions')
                .set('x-token', 'customFlatSecret');
            expect(res).to.have.status(200);
            expect(res.body.pending).to.deep.equal([asyncTaskId]);
            expect(res.body.done).to.be.empty;
        });
    }
});
