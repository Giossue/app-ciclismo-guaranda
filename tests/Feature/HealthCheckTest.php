<?php

test('returns an application readiness response without SSR', function () {
    $this->get(route('health'))
        ->assertSuccessful()
        ->assertExactJson(['status' => 'up']);
});
