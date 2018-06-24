import * as restify from 'restify';
import * as errors from 'restify-errors';
import * as bodyParser from 'body-parser';
import * as readline from 'readline';
import {DataBase} from "./DataBase";
import {UserController} from "./controller/UserController";


const port = 3000;

let database = new DataBase();
//let connection = database.getConnection();
let client = database.getClient();
let server = restify.createServer({
    name: "start"
});

const controller = new UserController();

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

if(client.connect())
{
    console.log("successful connection to " + database.getDBName());
}

server.get('/get-users', (req, res, next) => {
    res.send(200, controller.GetAllUsers());
    return next();
});

server.get('/search-user/:name', (req, res, next) => {
    if (!req.params.name) {
        return next(new errors.BadRequestError());
    }
    try {
        const user = controller.GetUserByName(req.params.name);
        res.send(200, user);
        return next();
    } catch (error) {
        return next(new errors.NotFoundError(error));
    }
});

server.post('/create-user', (req, res, next) => {
    if (!req.body || !req.body.name || !req.body.email) {
        return next(new errors.BadRequestError());
    }
    controller.CreateUser(req.body.name, req.body.email);
    res.send(201);
    return next();
});

server.put('/edit-user/:name', (req, res, next) => {
    if (!req.params.name || !req.body || !req.body.name) {
        return next(new errors.BadRequestError());
    }
    try {
        const user = controller.EditUser(req.body.id_user, req.params.name, req.body.email);
        res.send(200, user);
        return next();
    } catch (error) {
        return next(new errors.NotFoundError(error));
    }
});

server.del('/delete-user/:name', (req, res, next) => {
    if (!req.params.name) {
        return next(new errors.BadRequestError());
    }
    try {
        controller.DeleteUser(req.params.name);
        res.send(204);
        return next();
    } catch (error) {
        return next(new errors.NotFoundError(error));
    }
});


server.listen(port, ()=>{
    console.info('server started on ' + port + ' port');
});