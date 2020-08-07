<?php
declare(strict_types=1);

namespace MTGDemo\API\Action;

use Psr\Http\Message\ResponseInterface;
use Laminas\Diactoros\Response\JsonResponse;
use MTGDemo\Conversations;
use Nexmo\Client;
use OpenTok\OpenTok;
use Psr\Http\Message\ServerRequestInterface;

class GetGameTokens
{
    /**
     * @var Conversations
     */
    protected $conversations;

    /**
     * @var Client
     */
    protected $nexmo;

    /**
     * @var OpenTok
     */
    protected $openTok;

    /**
     * @var \Redis
     */
    protected $redis;

    public function __construct(Client $nexmo, Conversations $conversations, OpenTok $openTok, \Redis $redis)
    {
        $this->nexmo = $nexmo;
        $this->conversations = $conversations;
        $this->opentok = $openTok;
        $this->redis = $redis;
    }

    public function call(ServerRequestInterface $request, ResponseInterface $response, $args) : ResponseInterface
    {
        if ($this->redis->ping() === false) {
            throw new \RuntimeException('Redis is unavailable');
        }
    
        $gameData = $this->redis->get($args['id']);
        if (!$gameData) {
            return $response->withStatus(404);
        }
        $gameData = json_decode($gameData, true);
    
        $conversation = $this->conversations->getByName($args['id']);
        $user = $this->conversations->getUser($request->getParsedBody()['user_id']);
        $member = $this->conversations->addMember($conversation['id'], $request->getParsedBody()['user_id']);
    
        $data = [
            'ot_token' => $this->opentok->generateToken($gameData['video_session']),
            'member_id' => $member['id'],
            'conversation_token' => (string) $this->nexmo->generateJwt([
                'sub' => $user['name'],
                'exp' => time() + (3600 * 23),
                'acl' => [
                    'paths' => [
                        '/*/users/**' => (object) [],
                        '/*/conversations/**' => (object) [],
                        '/*/sessions/**' => (object) [],
                        '/*/devices/**' => (object) [],
                        '/*/image/**' => (object) [],
                        '/*/media/**' => (object) [],
                        '/*/applications/**' => (object) [],
                        '/*/push/**' => (object) [],
                        '/*/knocking/**' => (object) [],
                    ]
                ]
            ]),
        ];
    
        return new JsonResponse($data);
    }
}
