<?php

test('fails safely without PostgreSQL and does not attempt an extension query', function () {
    $this->artisan('ai:vector-preflight')
        ->expectsOutputToContain('requiere una conexión PostgreSQL')
        ->assertExitCode(1);
});
