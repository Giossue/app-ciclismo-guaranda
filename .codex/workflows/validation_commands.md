# Comandos de validación

Ejecutar desde `ciclismo-guaranda/`.

## Desarrollo local

```bash
composer run dev
```

## PHP/Laravel

```bash
composer lint
vendor/bin/pint --dirty --format agent
php artisan test --compact
composer types:check
```

## Frontend

```bash
npm run types:check
npm run lint:check
npm run format:check
npm run build
```

## Wayfinder

```bash
php artisan wayfinder:generate --with-form --no-interaction
```

## Capacitor Android

Cuando Capacitor esté instalado:

```bash
npm run build
npx cap sync android
npx cap open android
```

## Reglas

- Corre la validación mínima relacionada con el cambio.
- Si cambias PHP, ejecuta Pint/lint y tests relevantes.
- Si cambias TypeScript/React, ejecuta tipos y lint.
- Si cambias assets, Vite, Capacitor o UI crítica, ejecuta build.
- Para GPS/offline/cámara, validar en dispositivo Android real.
