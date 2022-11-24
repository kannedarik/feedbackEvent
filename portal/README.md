# Portal

### Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build:prod

```


### Compiles and minifies for lower environments
```
npm run build:prod

```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


### Important

Sangraha portal git repository is linked with [Payment-web](https://github.com/Rupeek/payment-web) git repository. PORTAL_URL of payment-web points to VUE_APP_URL of sangraha portal.Hence ``` PORTAL_URL = VUE_APP_URL ```.

#### Local Setup for Development

1. Open payment-web and sangraha-portal in two different windows of code editor.
2. Edit environment variables of ``` sangraha-portal ``` in .env.local and set``` VUE_APP_URL = http://localhost:8080 ```.
3. Edit environment variables of ``` payment-web ``` in .env.local for both Mobile and Desktop codebases and set ``` PORTAL_URL = '"http://localhost:8080"' ```.
4. Run ``` npm run serve ``` in ``` sangraha-portal ```.
5. Run ``` npm run dev ``` in ``` payment-web ``` for both Mobile and Desktop codebases.

