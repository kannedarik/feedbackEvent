# Order Management System

Microservice to maintain order state machine like renewal/release/part release

## Features

 - No transpilers, just vanilla javascript
 - ES2017 latest features like Async/Await
 - CORS enabled
 - Consistent coding styles with [editorconfig](http://editorconfig.org)
 - Uses [helmet](https://github.com/helmetjs/helmet) to set some HTTP headers for security
 - Load environment variables from .env files with [dotenv](https://github.com/rolodato/dotenv-safe)
 - Request validation with [joi](https://github.com/hapijs/joi)
 - Gzip compression with [compression](https://github.com/expressjs/compression)
 - Linting with [eslint](http://eslint.org)
 - Logging with [winston](https://github.com/bithavoc/express-winston)
 - Authentication and Authorization with [passport](http://passportjs.org)
 - API documentation generator with [apidoc](http://apidocjs.com)
 - Monitoring with [pm2](https://github.com/Unitech/pm2)

## Requirements

 - [Node v10.16+](https://nodejs.org/en/download/current/)

## Getting Started

Clone the repo:

```bash
git clone https://github.com/Rupeekapp/sangraha.git
cd sangraha/OMSService
```

Install dependencies:

```bash
npm install
```

Set environment variables in `.env`. Ask one of the developers for the `.env` file values for local development. Use `.env.example` for an example of the key names.


Make sure `core` is running locally first. See https://github.com/Rupeek/core.  

Start zeebe. Clone this repository: https://github.com/zeebe-io/zeebe-docker-compose  
Run `docker-compose up -d` in the `operate` folder.

## Running Locally

### Running the API server
```bash
npm run dev
```

### Running the worker

```bash
npm run worker | grep -v zeebe # to remove excess logging noise
```

### Deploy Zeebe workflows

Deploy these files in `src/api/workflows` to your Zeebe instance:
`src/api/workflows/loan-enhancement-order-bank-account-verification.bpmn`, `src/api/workflows/loan-enhancement-ticket.bpmn`, `src/api/workflows/renewal-flow-v2.bpmn`, `src/api/workflows/renewal-order-cancellation.bpmn`

## Running in Production

```bash
npm run start
```

## Logs

```bash
# show logs in production
pm2 logs
```

## Documentation

```bash
# generate and open api documentation
npm run docs
```

## Inspirations

 - [diegohaz/rest](https://github.com/diegohaz/rest)
