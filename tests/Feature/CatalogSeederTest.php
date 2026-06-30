<?php

use Database\Seeders\CatalogSeeder;

it('seeds the initial catalogs idempotently', function () {
    $expectedCatalogs = [
        'roles_usuario' => ['ciclista', 'administrador'],
        'generos' => ['masculino', 'femenino'],
        'estados_ruta' => ['borrador', 'activa', 'inactiva'],
        'dificultades_ruta' => ['fácil', 'media', 'difícil'],
        'categorias_ruta' => ['familiar', 'MTB', 'urbana', 'montaña', 'turística'],
        'motores_enrutamiento' => ['OSRM', 'GraphHopper', 'OpenRouteService'],
        'medios_transporte' => ['bicicleta', 'caminata'],
        'categorias_poi' => ['comida', 'tienda', 'taller', 'salud', 'hospedaje', 'mirador'],
        'rangos_precio' => ['económico', 'moderado', 'alto'],
        'tipos_cocina' => ['ecuatoriana', 'comida rápida', 'cafetería', 'vegetariana', 'internacional'],
        'tipos_hospedaje' => ['hotel', 'hostal', 'hostería', 'casa de huéspedes', 'camping'],
        'tipos_tienda' => ['tienda de abarrotes', 'minimarket', 'supermercado', 'tienda deportiva', 'farmacia'],
        'especialidades_taller' => ['bicicletas', 'frenos', 'transmisión', 'suspensión', 'llantas'],
        'servicios_taller' => ['reparación básica', 'inflado de llantas', 'cambio de tubo', 'ajuste de frenos', 'lubricación de cadena', 'venta de repuestos'],
        'tipos_centro_salud' => ['hospital', 'centro de salud', 'clínica', 'farmacia', 'puesto de auxilio'],
        'estados_recorrido' => ['en curso', 'pausado', 'finalizado', 'cancelado'],
        'tipos_incidencia' => ['derrumbe', 'obstáculo', 'vía cerrada', 'inseguridad', 'accidente', 'daño en señalética'],
        'estados_incidencia' => ['reportada', 'en revisión', 'resuelta', 'descartada'],
        'estados_moderacion' => ['pendiente', 'aprobado', 'oculto', 'rechazado'],
        'formatos_exportacion' => ['GPX', 'GeoJSON'],
    ];

    $this->seed(CatalogSeeder::class);
    $this->seed(CatalogSeeder::class);

    foreach ($expectedCatalogs as $table => $names) {
        $this->assertDatabaseCount($table, count($names));

        foreach ($names as $name) {
            $this->assertDatabaseHas($table, ['name' => $name]);
        }
    }

    foreach (['OSRM', 'GraphHopper', 'OpenRouteService'] as $name) {
        $this->assertDatabaseHas('motores_enrutamiento', [
            'name' => $name,
            'active' => true,
        ]);
    }
});
