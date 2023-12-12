<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">Product microservice built on top of <a href="https://nestjs.com/" target="_blank">NestJS</a> framework.</p>

## Description

As part of a simple order system demonstrating a possible Microservices architecture, this microservice focuses on product listing, full text search, and stock management. It's not publicly accessible and only called internally by an API Gateway, client controller or event via TCP protocol.

It is triggered in 2 different ways: *Message Pattern* (request-response) and *Events Pattern*. Client can send message to it to search/get a product list or detailed product information. It's also triggered by a specific event so that it can update products' in-stock quantities when they are purchased.

Check *order-demo-api* project for its Open API definition.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

This demo is created and maintained by Yao Pian.