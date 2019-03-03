FROM node:alpine AS jsbuild

WORKDIR /app
COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock

RUN npx yarn install

COPY ./client ./client

RUN npm run build


FROM python:3.7-alpine

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

RUN pip install --upgrade pip
RUN pip install pipenv
COPY ./Pipfile ./Pipfile
COPY ./Pipfile.lock ./Pipfile.lock
RUN pipenv install --system --deploy
COPY . .
COPY --from=jsbuild /app/client/static /app/client/static

RUN python manage.py collectstatic
RUN python manage.py migrate

EXPOSE 8000

ENV GUNICORN_CMD_ARGS "--bind=0.0.0.0:8000"
CMD ["gunicorn", "minesweeper.wsgi"]
