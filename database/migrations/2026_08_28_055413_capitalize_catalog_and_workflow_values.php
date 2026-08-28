<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $this->renameCatalogValues($this->forwardCatalogValues());
        $this->renameWorkflowValues($this->forwardWorkflowValues());
        $this->updateWorkflowDefaults();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $this->updateWorkflowDefaults(reverse: true);
        $this->renameWorkflowValues($this->reverseWorkflowValues($this->forwardWorkflowValues()));
        $this->renameCatalogValues($this->reverse($this->forwardCatalogValues()));
    }

    /**
     * @param  array<string, array<string, string>>  $values
     */
    private function renameCatalogValues(array $values): void
    {
        foreach ($values as $table => $renames) {
            foreach ($renames as $from => $to) {
                $this->renameValue($table, 'name', $from, $to);
            }
        }
    }

    /**
     * @param  array<string, array<string, array<string, string>>>  $values
     */
    private function renameWorkflowValues(array $values): void
    {
        foreach ($values as $table => $renames) {
            foreach ($renames as $column => $columnRenames) {
                foreach ($columnRenames as $from => $to) {
                    $this->renameValue($table, $column, $from, $to);
                }
            }
        }
    }

    private function renameValue(string $table, string $column, string $from, string $to): void
    {
        if (! DB::table($table)->where($column, $from)->exists()) {
            return;
        }

        if (DB::table($table)->where($column, $to)->exists()) {
            throw new RuntimeException("No se puede renombrar [{$table}.{$column}] de [{$from}] a [{$to}] porque el valor de destino ya existe.");
        }

        DB::table($table)->where($column, $from)->update([$column => $to]);
    }

    private function updateWorkflowDefaults(bool $reverse = false): void
    {
        $defaults = $reverse
            ? [
                'sugerencias_punto_interes' => ['status' => 'pendiente'],
                'reportes_punto_interes' => ['status' => 'pendiente'],
                'descargas_ruta' => ['download_status' => 'iniciada'],
                'entradas_cola_sincronizacion' => ['status' => 'pendiente'],
            ]
            : [
                'sugerencias_punto_interes' => ['status' => 'Pendiente'],
                'reportes_punto_interes' => ['status' => 'Pendiente'],
                'descargas_ruta' => ['download_status' => 'Iniciada'],
                'entradas_cola_sincronizacion' => ['status' => 'Pendiente'],
            ];

        foreach ($defaults as $table => $columns) {
            Schema::table($table, function (Blueprint $blueprint) use ($columns): void {
                foreach ($columns as $column => $default) {
                    $blueprint->string($column)->default($default)->change();
                }
            });
        }
    }

    /**
     * @return array<string, array<string, array<string, string>>>
     */
    private function forwardCatalogValues(): array
    {
        return [
            'roles_usuario' => ['ciclista' => 'Ciclista', 'administrador' => 'Administrador'],
            'generos' => ['masculino' => 'Masculino', 'femenino' => 'Femenino'],
            'estados_ruta' => ['borrador' => 'Borrador', 'activa' => 'Activa', 'inactiva' => 'Inactiva'],
            'dificultades_ruta' => ['fácil' => 'Fácil', 'media' => 'Media', 'difícil' => 'Difícil'],
            'categorias_ruta' => ['familiar' => 'Familiar', 'urbana' => 'Urbana', 'montaña' => 'Montaña', 'turística' => 'Turística'],
            'medios_transporte' => ['bicicleta' => 'Bicicleta', 'caminata' => 'Caminata'],
            'categorias_poi' => ['comida' => 'Comida', 'tienda' => 'Tienda', 'taller' => 'Taller', 'salud' => 'Salud', 'hospedaje' => 'Hospedaje', 'mirador' => 'Mirador'],
            'rangos_precio' => ['económico' => 'Económico', 'moderado' => 'Moderado', 'alto' => 'Alto'],
            'tipos_cocina' => ['ecuatoriana' => 'Ecuatoriana', 'comida rápida' => 'Comida rápida', 'cafetería' => 'Cafetería', 'vegetariana' => 'Vegetariana', 'internacional' => 'Internacional'],
            'tipos_hospedaje' => ['hotel' => 'Hotel', 'hostal' => 'Hostal', 'hostería' => 'Hostería', 'casa de huéspedes' => 'Casa de huéspedes', 'camping' => 'Camping'],
            'tipos_tienda' => ['tienda de abarrotes' => 'Tienda de abarrotes', 'minimarket' => 'Minimarket', 'supermercado' => 'Supermercado', 'tienda deportiva' => 'Tienda deportiva', 'farmacia' => 'Farmacia'],
            'especialidades_taller' => ['bicicletas' => 'Bicicletas', 'frenos' => 'Frenos', 'transmisión' => 'Transmisión', 'suspensión' => 'Suspensión', 'llantas' => 'Llantas'],
            'servicios_taller' => ['reparación básica' => 'Reparación básica', 'inflado de llantas' => 'Inflado de llantas', 'cambio de tubo' => 'Cambio de tubo', 'ajuste de frenos' => 'Ajuste de frenos', 'lubricación de cadena' => 'Lubricación de cadena', 'venta de repuestos' => 'Venta de repuestos'],
            'tipos_centro_salud' => ['hospital' => 'Hospital', 'centro de salud' => 'Centro de salud', 'clínica' => 'Clínica', 'farmacia' => 'Farmacia', 'puesto de auxilio' => 'Puesto de auxilio'],
            'estados_recorrido' => ['en curso' => 'En curso', 'pausado' => 'Pausado', 'finalizado' => 'Finalizado', 'cancelado' => 'Cancelado'],
            'tipos_incidencia' => ['derrumbe' => 'Derrumbe', 'obstáculo' => 'Obstáculo', 'vía cerrada' => 'Vía cerrada', 'inseguridad' => 'Inseguridad', 'accidente' => 'Accidente', 'daño en señalética' => 'Daño en señalética'],
            'estados_incidencia' => ['reportada' => 'Reportada', 'en revisión' => 'En revisión', 'resuelta' => 'Resuelta', 'descartada' => 'Descartada'],
            'estados_moderacion' => ['pendiente' => 'Pendiente', 'aprobado' => 'Aprobado', 'oculto' => 'Oculto', 'rechazado' => 'Rechazado'],
        ];
    }

    /**
     * @return array<string, array<string, string>>
     */
    private function forwardWorkflowValues(): array
    {
        return [
            'sugerencias_punto_interes' => ['status' => ['pendiente' => 'Pendiente']],
            'reportes_punto_interes' => [
                'report_type' => ['cerrado' => 'Cerrado', 'datos incorrectos' => 'Datos incorrectos', 'otro' => 'Otro'],
                'status' => ['pendiente' => 'Pendiente'],
            ],
            'descargas_ruta' => ['download_status' => ['iniciada' => 'Iniciada', 'completada' => 'Completada', 'error' => 'Error', 'eliminada' => 'Eliminada']],
            'entradas_cola_sincronizacion' => ['status' => ['pendiente' => 'Pendiente', 'enviado' => 'Enviado', 'error' => 'Error']],
        ];
    }

    /**
     * @param  array<string, mixed>  $values
     * @return array<string, mixed>
     */
    private function reverse(array $values): array
    {
        return array_map(fn (array $renames): array => array_flip($renames), $values);
    }

    /**
     * @param  array<string, array<string, array<string, string>>>  $values
     * @return array<string, array<string, array<string, string>>>
     */
    private function reverseWorkflowValues(array $values): array
    {
        return array_map(
            fn (array $columns): array => array_map(
                fn (array $renames): array => array_flip($renames),
                $columns,
            ),
            $values,
        );
    }
};
