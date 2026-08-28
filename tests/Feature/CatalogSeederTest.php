<?php

use Database\Seeders\CatalogSeeder;
use Illuminate\Support\Facades\DB;

it('seeds the initial catalogs idempotently', function () {
    $expectedCatalogs = [
        'roles_usuario' => ['Ciclista', 'Administrador'],
        'generos' => ['Masculino', 'Femenino'],
        'estados_ruta' => ['Borrador', 'Activa', 'Inactiva'],
        'dificultades_ruta' => ['Fácil', 'Media', 'Difícil'],
        'categorias_ruta' => ['Familiar', 'MTB', 'Urbana', 'Montaña', 'Turística'],
        'motores_enrutamiento' => ['OSRM', 'GraphHopper', 'OpenRouteService'],
        'medios_transporte' => ['Bicicleta', 'Caminata'],
        'categorias_poi' => ['Comida', 'Tienda', 'Taller', 'Salud', 'Hospedaje', 'Mirador'],
        'rangos_precio' => ['Económico', 'Moderado', 'Alto'],
        'tipos_cocina' => ['Ecuatoriana', 'Comida rápida', 'Cafetería', 'Vegetariana', 'Internacional'],
        'tipos_hospedaje' => ['Hotel', 'Hostal', 'Hostería', 'Casa de huéspedes', 'Camping'],
        'tipos_tienda' => ['Tienda de abarrotes', 'Minimarket', 'Supermercado', 'Tienda deportiva', 'Farmacia'],
        'especialidades_taller' => ['Bicicletas', 'Frenos', 'Transmisión', 'Suspensión', 'Llantas'],
        'servicios_taller' => ['Reparación básica', 'Inflado de llantas', 'Cambio de tubo', 'Ajuste de frenos', 'Lubricación de cadena', 'Venta de repuestos'],
        'tipos_centro_salud' => ['Hospital', 'Centro de salud', 'Clínica', 'Farmacia', 'Puesto de auxilio'],
        'estados_recorrido' => ['En curso', 'Pausado', 'Finalizado', 'Cancelado'],
        'tipos_incidencia' => ['Derrumbe', 'Obstáculo', 'Vía cerrada', 'Inseguridad', 'Accidente', 'Daño en señalética'],
        'estados_incidencia' => ['Reportada', 'En revisión', 'Resuelta', 'Descartada'],
        'estados_moderacion' => ['Pendiente', 'Aprobado', 'Oculto', 'Rechazado'],
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

it('converts legacy catalog values without changing their identifiers', function () {
    $this->seed(CatalogSeeder::class);

    DB::table('roles_usuario')->where('name', 'Administrador')->update(['name' => 'administrador']);
    DB::table('categorias_poi')->where('name', 'Comida')->update(['name' => 'comida']);
    DB::table('estados_recorrido')->where('name', 'En curso')->update(['name' => 'en curso']);

    $migration = require database_path('migrations/2026_08_28_055413_capitalize_catalog_and_workflow_values.php');

    $migration->up();

    $this->assertDatabaseHas('roles_usuario', ['name' => 'Administrador']);
    $this->assertDatabaseHas('categorias_poi', ['name' => 'Comida']);
    $this->assertDatabaseHas('estados_recorrido', ['name' => 'En curso']);
    $this->assertDatabaseHas('motores_enrutamiento', ['name' => 'OSRM']);

    $migration->down();

    $this->assertDatabaseHas('roles_usuario', ['name' => 'administrador']);
    $this->assertDatabaseHas('categorias_poi', ['name' => 'comida']);
    $this->assertDatabaseHas('estados_recorrido', ['name' => 'en curso']);
    $this->assertDatabaseHas('motores_enrutamiento', ['name' => 'OSRM']);
});
