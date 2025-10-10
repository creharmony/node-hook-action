import fs from "fs";
import HookServer from './HookServer.js';

export class WebhookServerLauncher {
    async loadConfiguration() {
        const rawConfig = await fs.promises.readFile("./config.json");
        return JSON.parse(rawConfig.toString());
    }

    async initializeServer(config) {
                const hookServer = new HookServer(config);
        await hookServer.start();
        return hookServer;
    }

    static async launch() {
        try {
            // DEBUG // console.log("Launching webhook server...");
            const launcher = new WebhookServerLauncher();
            const config = await launcher.loadConfiguration();
            return await launcher.initializeServer(config);
        } catch (error) {
            console.log(error.stack)
            throw new Error(`Failed to launch webhook server: ${error.message}`);
        }
    }
}
