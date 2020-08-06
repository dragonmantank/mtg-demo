<?php
declare(strict_types=1);

namespace MTGDemo;

use Laminas\Diactoros\Request\Serializer;
use Nexmo\Client;
use Nexmo\JWT\TokenGenerator;
use Laminas\Diactoros\RequestFactory;

class Conversations
{
    /**
     * @var Client
     */
    protected $nexmoClient;

    /**
     * @var TokenGenerator
     */
    protected $tokenGenerator;

    public function __construct(Client $client, string $appId, string $privateKey)
    {
        $this->nexmoClient = $client;
        $this->tokenGenerator = new TokenGenerator($appId, $privateKey);
    }

    public function create(string $name) : ?array
    {
        $factory = new RequestFactory();
        $request = $factory->createRequest(
            'POST',
            'https://api.nexmo.com/beta/conversations',
        );
        $request->getBody()->write(json_encode(
            [
                'name' => $name,
                'display_name' => 'Game',
                'image_url' => 'https://dragonmantank.ngrok.io/image',
                'properties' => [
                    'ttl' => 60
                ],
            ]
        ));
        $request = $request->withAddedHeader('Content-Type', 'application/json');

        $apiResponse = $this->nexmoClient->send($request);
        $data = json_decode($apiResponse->getBody()->getContents(), true);

        return $data;
    }

    public function getByName($name) : ?array
    {
        $factory = new RequestFactory();
        $request = $factory->createRequest(
            'GET',
            'https://api.nexmo.com/beta2/conversations',
            [
                'query' => ['name' => $name]
            ]
        );

        $apiResponse = $this->nexmoClient->send($request);
        $data = json_decode($apiResponse->getBody()->getContents(), true);

        if (count($data['_embedded']['data']['conversations']) === 1) {
            return $data['_embedded']['data']['conversations'][0];
        }
        
        return null;
    }

    public function getUserByName(string $name) : ?array
    {
        $factory = new RequestFactory();
        $request = $factory->createRequest(
            'GET',
            'https://api.nexmo.com/beta2/users',
            [
                'query' => ['name' => $name]
            ]
        );

        $apiResponse = $this->nexmoClient->send($request);
        $data = json_decode($apiResponse->getBody()->getContents(), true);

        if (count($data['_embedded']['data']['users']) === 1) {
            return $data['_embedded']['data']['users'][0];
        }
        
        return null;       
    }

    public function findMemberByUserId(string $conversationId, string $userId) : ?array
    {
        $factory = new RequestFactory();
        $request = $factory->createRequest(
            'GET',
            'https://api.nexmo.com/beta2/conversations/' . $conversationId . '/members',
            [
                'query' => ['user_id' => $userId]
            ]
        );

        $apiResponse = $this->nexmoClient->send($request);
        $data = json_decode($apiResponse->getBody()->getContents(), true);

        if (count($data['_embedded']['data']['members']) === 1) {
            return $data['_embedded']['data']['members'][0];
        }
        
        return null;       
    }

    public function createUser(string $name) : array
    {
        $factory = new RequestFactory();
        $request = $factory->createRequest(
            'POST',
            'https://api.nexmo.com/beta/users',
        );
        $request->getBody()->write(json_encode(['name' => $name, 'display_name' => $name]));
        $request = $request->withAddedHeader('Content-Type', 'application/json');

        $apiResponse = $this->nexmoClient->send($request);
        $data = json_decode($apiResponse->getBody()->getContents(), true);

        return $data;
    }

    public function addMember(string $conversationId, string $userId) : array
    {
        $factory = new RequestFactory();
        $request = $factory->createRequest(
            'POST',
            'https://api.nexmo.com/beta/conversations/' . $conversationId . '/members',
        );
        $request->getBody()->write(json_encode([
            'action' => 'join',
            'user_id' => $userId,
            'channel' => [
                'type' => 'app'
            ]
        ]));
        $request = $request->withAddedHeader('Content-Type', 'application/json');

        $apiResponse = $this->nexmoClient->send($request);
        $data = json_decode($apiResponse->getBody()->getContents(), true);

        return $data;
    }
}