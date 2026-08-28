# Bootstrap y comandos reales

Usa las herramientas ya declaradas por el repositorio; no copies `pnpm`/Express desde un contexto ajeno.

```bash
composer install
npm install
php artisan migrate
npm run build
```

Validación habitual:

```bash
composer lint
php artisan test --compact
npm run types:check
npm run lint:check
npm run format:check
```

Para cambios nativos: `npm run build`, `npx cap sync android` y pruebas en Android 13+. Los datos reales de producción y las credenciales siguen las reglas de `.codex/rules/database_operations.md`.
