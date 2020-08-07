<?php
declare(strict_types=1);

namespace MTGDemo\API\Action;

use Psr\Http\Message\ResponseInterface;
use Laminas\Diactoros\Response\JsonResponse;
use MTGDemo\Conversations;
use Nexmo\Client;
use Psr\Http\Message\ServerRequestInterface;

class JoinLobby
{
    /**
     * @var Conversations
     */
    protected $conversations;

    /**
     * @var Client
     */
    protected $nexmo;

    public function __construct(Client $nexmo, Conversations $conversations)
    {
        $this->nexmo = $nexmo;
        $this->conversations = $conversations;
    }

    public function call(ServerRequestInterface $request, ResponseInterface $response) : ResponseInterface
    {
        $body = $request->getParsedBody();
    
        $user = $this->conversations->getUserByName($body['username']);
    
        if (!$user) {
            $user = $this->conversations->createUser($body['username']);   
        }
    
        $lobbyConversation = $this->conversations->getByName('lobby');
        if (!$lobbyConversation) {
            $lobbyConversation = $this->conversations->create('lobby');
        }
    
        $member = $this->conversations->findMemberByUserId($lobbyConversation['id'], $user['user_id'] ?? $user['id']);
        if (!$member) {
            $member = $this->conversations->addMember($lobbyConversation['id'], $user['user_id'] ?? $user['id']);
        }
    
        return new JsonResponse([
            'user_id' => $user['user_id'] ?? $user['id'],
            'member_id' => $member['id'],
            'lobby' => $lobbyConversation['id'],
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
        ]);
    }
}
