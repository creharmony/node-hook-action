import express from "express";
import createError from 'http-errors';
import HookService from './HookService.js';
import HookLogger from './HookLogger.js';
import {matrix as API_MATRIX} from './routes/ApiRoutes.js';

export default class HookServer {

    constructor(config) {
        if (!config || !config.server_config) {
            throw "missing server config";
        }
        this._config = config;
        this._port = config.server_config.port;
        this._hostname = config.server_config.host;
        this._service = new HookService(config);
        this._logger = new HookLogger(config);
    }

    close() {
        const hookServer = this;
        console.log('stop');
        if (hookServer.listeningServer) {
            hookServer.listeningServer.close();
        }
    }

    /**
     * server error handler
     */
    onError(err) {
        this._logger.error("HookServer error: " + err);
    }

    start() {
        const hookServer = this;
        return new Promise(resolve => {
            hookServer.app = express();
            hookServer.app.use(express.json());// accept json payload

            const serverPath = hookServer._config.server_config.path;
            const listeningUrl = `http://${this._hostname}:${this._port}${serverPath}`;

            //~ API options
            const apiOptions = {
                config: hookServer._config,
                service: hookServer._service,
                logger: hookServer._logger,
                listeningUrl
            };
            //~ API mapping
            Object.keys(API_MATRIX).forEach(apiPath => {
                const apiEndpoint = serverPath + apiPath;
                // DEBUG // hookServer._logger.debug(` * serve route ${apiEndpoint}`);
                hookServer.app.use(apiEndpoint, API_MATRIX[apiPath](apiOptions));
            });

            // catch 404 and forward to error handler
            hookServer.app.use((req, res, next) => {
                // DEBUG // console.info("MDW req",req.path);
                next(createError(404));
            });


            //~ Express listen
            hookServer.listeningServer = hookServer.app
                .listen(hookServer._port, hookServer._hostname, () => {
                    hookServer._logger.info(`Listening ${listeningUrl}`);
                    resolve(hookServer);
                })
                .on('error', hookServer.onError.bind(this));
        });
    }
}
