<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RouteDownload extends Model
{
    protected $table = 'descargas_ruta';

    protected $guarded = ['id'];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return BelongsTo<CyclingRoute, $this>
     */
    public function route(): BelongsTo
    {
        return $this->belongsTo(CyclingRoute::class, 'route_id');
    }

    /**
     * @return BelongsTo<ExportFormat, $this>
     */
    public function exportFormat(): BelongsTo
    {
        return $this->belongsTo(ExportFormat::class, 'export_format_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'route_version' => 'integer',
            'size_mb' => 'decimal:2',
            'downloaded_at' => 'datetime',
            'local_deleted_at' => 'datetime',
        ];
    }
}
