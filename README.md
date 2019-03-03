# Minesweeper

Minesweeper game made with Django, React, and NES.css. React app is in `client/js`, and back-end is in `games`.

## Running it

### Dependencies

* Python 3.x
* Recent Node.js
* pipenv
* npm/yarn (npm causes some problems with eslint)

### Locally (development)

To run the application locally, install all dependencies, then start the Django dev server and the live-reloading JS build:

```sh
pipenv install
yarn install # or npm install
pipenv shell
python manage.py migrate
python manage.py runserver &
yarn dev
```

### Deployment

The application can be hosted with Docker and Traefik. Change the hostname in the `traefik.frontend.rule` label in the docker-compose file, then run the following:

```sh
docker-compose up -d --build
docker exec -it minesweeper sh
python manage.py migrate
```
