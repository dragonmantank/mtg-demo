<?php

use Dotenv\Dotenv;
use MTGDemo\API\Action\CreateGame;
use MTGDemo\API\Action\GetGameTokens;
use MTGDemo\API\Action\JoinLobby;
use Slim\Factory\AppFactory;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$container = require_once __DIR__ . '/../app/container.php';

AppFactory::setContainer($container);
$app = AppFactory::create();
$app->addErrorMiddleware(true, true, true);
$app->addBodyParsingMiddleware();
$app->addRoutingMiddleware();

$app->map(['GET', 'POST'], '/game[/{id}]', CreateGame::class . ':call');
$app->map(['GET', 'POST'], '/game/{id}/token', GetGameTokens::class . ':call');
$app->map(['GET', 'POST'], '/lobby/users', JoinLobby::class . ':call');
$app->get('/', function(ServerRequestInterface $request, ResponseInterface $response) {
    $response->getBody()->write('Hello world');
    return $response;
});

$app->run();
