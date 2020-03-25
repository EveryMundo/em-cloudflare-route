# em-cloudflare-route

Easily provision cloudflare route [Serverless Components](https://github.com/serverless/components).

&nbsp;

1. [Install](#1-install)
2. [Create](#2-create)
3. [Configure](#3-configure)
4. [Deploy](#4-deploy)

&nbsp;


### 1. Install

```console
$ npm i @everymundo/em-cloudflare-route@0.0.0
```

### 2. Create

```console
$ mkdir demo de && cd demo
```

Just create a `serverless.yml` file

```shell
$ touch serverless.yml
$ touch .env      # your CF credentials
```

```
# .env
CF_ACCOUNT_ID=
CF_EMAIL=
CF_KEY=
CF_ZONE_ID=

```

### 3. Configure
Create a `serverless.yml` file:

```yml
# serverless.yml
name: demo
stage: dev
plugins:
   - serverless-dotenv-plugin
demo:
  #component: '@everymundo/em-cloudflare-route@0.0.0'
  component: '../'
  inputs:
      routeName: al-dev.com
      routePatternPostfix: /*
      workerName: geoip
    
        
```

Use the environment variables  `CF_ACCOUNT_ID`, `CF_EMAIL`, `CF_KEY` and `CF_ZONE_ID` to specify your Cloudflare API credentials.

### 4. Deploy

```console
$ severless
```

&nbsp;

### New to Components?

Checkout the [Serverless Components](https://github.com/serverless/components) repo for more information.
