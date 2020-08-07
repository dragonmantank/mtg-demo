<?php
declare(strict_types=1);

use DI\Container;
use OpenTok\OpenTok;
use MTGDemo\Conversations;
use Nexmo\Client as NexmoClient;
use MTGDemo\API\Action\JoinLobby;
use MTGDemo\API\Action\CreateGame;
use MTGDemo\API\Action\GetGameTokens;
use Nexmo\Client\Credentials\Keypair;

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

$container->set('redis', function() {
    $redisUrl = $_ENV['REDIS'];
    if (!$redisUrl) {
        $redisUrl = '127.0.0.1';
    }

    $redis = new \Redis();
    $redis->connect($redisUrl);

    return $redis;
});

$container->set(JoinLobby::class, function() use ($container) {
    return new JoinLobby($container->get(NexmoClient::class), $container->get(Conversations::class));
});

$container->set(GetGameTokens::class, function() use ($container) {
    return new GetGameTokens(
        $container->get(NexmoClient::class),
        $container->get(Conversations::class),
        $container->get(OpenTok::class),
        $container->get('redis')
    );
});

$container->set(CreateGame::class, function() use ($container) {
    return new CreateGame(
        $container->get(Conversations::class),
        $container->get(OpenTok::class),
        $container->get('redis')
    );
});

return $container;