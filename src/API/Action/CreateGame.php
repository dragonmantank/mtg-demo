<?php
declare(strict_types=1);

namespace MTGDemo\API\Action;

use Psr\Http\Message\ResponseInterface;
use Laminas\Diactoros\Response\JsonResponse;
use MTGDemo\Conversations;
use OpenTok\OpenTok;
use Psr\Http\Message\ServerRequestInterface;

class CreateGame
{
    /**
     * @var Conversations
     */
    protected $conversations;

    /**
     * @var OpenTok
     */
    protected $openTok;

    /**
     * @var \Redis
     */
    protected $redis;

    public function __construct(Conversations $conversations, OpenTok $openTok, \Redis $redis)
    {
        $this->conversations = $conversations;
        $this->openTok = $openTok;
        $this->redis = $redis;
    }

    public function call(ServerRequestInterface $request, ResponseInterface $response, $args) : ResponseInterface
    {
        if ($this->redis->ping() === false) {
            throw new \RuntimeException('Redis is unavailable');
        }
    
        if (array_key_exists('id', $args)) {
            $gameData = $this->redis->get($args['id']);
            if ($gameData) {
                return new JsonResponse(json_decode($gameData, true));
            }
            return $response->withStatus(404);
        }
    
        $permitted_chars = '0123456789abcdefghijklmnopqrstuvwxyz';
        $roomId = substr(str_shuffle($permitted_chars), 0, 10);
    
        $session = $this->openTok->createSession();
    
        $convo = $this->conversations->getByName($roomId);
    
        if (!$convo) {
            $convo = $this->conversations->create($roomId);
        }
    
        $gameData = [
            'video_session' => $session->getSessionId(),
            'conversation_session' => $convo['id'],
            'room_id' => $roomId,
        ];
    
        $this->redis->set($roomId, json_encode($gameData));
    
        return new JsonResponse($gameData);
    }
}
