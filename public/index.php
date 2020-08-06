<?php

use DI\Container;
use Dotenv\Dotenv;
use Laminas\Diactoros\Response\JsonResponse;
use OpenTok\OpenTok;
use Slim\Factory\AppFactory;
use Nexmo\Client as NexmoClient;
use Nexmo\Client\Credentials\Keypair;
use Psr\Http\Message\ResponseInterface;
use MTGDemo\Conversations;
use Psr\Http\Message\ServerRequestInterface;

require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$container = new Container();
$container->set(OpenTok::class, function () {
    return new OpenTok(getenv('OT_KEY'), getenv('OT_SECRET'));
});

$container->set(NexmoClient::class, function () {
    return new NexmoClient(
        new Keypair(
            file_get_contents(getenv('NEXMO_PRIVATE_KEY_PATH')), 
            getenv('NEXMO_APP_ID')
        )
    );
});

$container->set(Conversations::class, function() use ($container) {
    return new Conversations(
        $container->get(NexmoClient::class),
        getenv('NEXMO_APP_ID'),
        file_get_contents(getenv('NEXMO_PRIVATE_KEY_PATH'))
    );
});

AppFactory::setContainer($container);
$app = AppFactory::create();
$app->addErrorMiddleware(true, true, true);
$app->addBodyParsingMiddleware();
$app->addRoutingMiddleware();

$app->map(['GET', 'POST'], '/game[/{id}]', function (ServerRequestInterface $request, ResponseInterface $response, $args) {
    $redis = new Redis();
    $redis->connect('redis');
    if ($redis->ping() === false) {
        throw new \RuntimeException('Redis is unavailable');
    }

    if (array_key_exists('id', $args)) {
        $gameData = $redis->get($args['id']);
        if ($gameData) {
            return new JsonResponse(json_decode($gameData, true));
        }
    }

    $permitted_chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    $roomId = substr(str_shuffle($permitted_chars), 0, 10);

    $openTok = $this->get(OpenTok::class);
    $session = $openTok->createSession();

    /** @var Conversations $conversationService */
    $conversationService = $this->get(Conversations::class);
    $convo = $conversationService->getByName($roomId);

    if (!$convo) {
        $convo = $conversationService->create($roomId);
    }

    $gameData = [
        'video_session' => $session->getSessionId(),
        'conversation_session' => $convo['id'],
        'room_id' => $roomId,
    ];

    $redis->set($roomId, json_encode($gameData));

    return new JsonResponse($gameData);
});

$app->map(['GET', 'POST'], '/game/{id}/token', function (ServerRequestInterface $request, ResponseInterface $response, $args) {
    $redis = new Redis();
    $redis->connect('redis');
    if ($redis->ping() === false) {
        throw new \RuntimeException('Redis is unavailable');
    }

    $gameData = $redis->get($args['id']);
    if (!$gameData) {
        return $response->withStatus(404);
    }
    $gameData = json_decode($gameData, true);

    /** @var OpenTok $opentok */
    $opentok = $this->get(OpenTok::class);

    $data = [
        'token' => $opentok->generateToken($gameData['video_session'])
    ];

    return new JsonResponse($data);
});

$app->get('/', function(ServerRequestInterface $request, ResponseInterface $response) {
    $response->getBody()->write('Hello world');
    return $response;
});

$app->map(['GET', 'POST'], '/lobby/users', function(ServerRequestInterface $request, ResponseInterface $response) {
    $body = $request->getParsedBody();

    /** @var Conversations $conversationService */
    $conversationService = $this->get(Conversations::class);
    $user = $conversationService->getUserByName($body['username']);

    if (!$user) {
        $user = $conversationService->createUser($body['username']);
    }

    $lobbyConversation = $conversationService->getByName('lobby');
    if (!$lobbyConversation) {
        $lobbyConversation = $conversationService->create('lobby');
    }

    $member = $conversationService->findMemberByUserId($lobbyConversation['id'], $user['user_id'] ?? $user['id']);
    if (!$member) {
        $member = $conversationService->addMember($lobbyConversation['id'], $user['user_id'] ?? $user['id']);
    }

    return new JsonResponse([
        'member_id' => $member['id'],
        'lobby' => $lobbyConversation['id']
    ]);
});

$app->run();