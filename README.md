# mtg-demo

## Frontend Build Directions

The UI uses `create-react-app`.

Use `npm start` in the `frontend` folder to run a development version.

Use `npm run build` in the `frontend` folder to build a production version.
The public folder is located at `frontend\public`.

## PHP Build Directions

`php -S localhost:8080 -t public` will start the dev server

## Development

1. Copy `.env.dist` to `.env`
2. Edit file with your OpenTok and Nexmo info
3. Run `composer install` in the root of the project to download PHP dependencies
4. In `frontend/`, run `npm install` to download Node dependencies

### Docker

`./cb dev` can be used to start the development images. The JS frontend is available then at `http://localhost:3000` and the PHP API available at `http://localhost:8080`

### Local

You will need:

* Redis
* PHP 7.1 or higher
* Node 12 or higher
