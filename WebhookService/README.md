# Webhook Service

In house service for webhook

## Features

 - No transpilers, just vanilla javascript
 - ES2017 latest features like Async/Await
 - CORS enabled
 - Express
 - Consistent coding styles with [editorconfig](http://editorconfig.org)
 - Uses [helmet](https://github.com/helmetjs/helmet) to set some HTTP headers for security
 - Load environment variables from .env files with [dotenv](https://github.com/rolodato/dotenv-safe)
 - Request validation with [celebrate](https://www.npmjs.com/package/celebrate)
 - Gzip compression with [compression](https://github.com/expressjs/compression)
 - Linting with [eslint](http://eslint.org)
 - Logging with [winston](https://github.com/winstonjs/winston)
 - API documentation generator with [apidoc](http://apidocjs.com)

## Requirements

 - [Node v12.15.0+](https://nodejs.org/en/download/current/)

## Getting Started

Clone the repo:

```bash
git clone https://github.com/Rupeekapp/sangraha.git
cd sangraha/WebhookService
```

Install dependencies:

```bash
npm install
```

Set environment variables:

```bash
cp .env.example .env
```

## Running Locally

```bash
npm run dev
```

## Documentation

```bash
# generate and open api documentation
npm run docs
```

## Inspirations

 - [KunalKapadia/express-mongoose-es6-rest-api](https://github.com/KunalKapadia/express-mongoose-es6-rest-api)
 - [diegohaz/rest](https://github.com/diegohaz/rest)
