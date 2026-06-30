<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class RouteRating extends Model
{
    use SoftDeletes;

    protected $table = 'valoraciones_ruta';

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
     * @return BelongsTo<Track, $this>
     */
    public function track(): BelongsTo
    {
        return $this->belongsTo(Track::class, 'track_id');
    }

    /**
     * @return BelongsTo<ModerationStatus, $this>
     */
    public function moderationStatus(): BelongsTo
    {
        return $this->belongsTo(ModerationStatus::class, 'moderation_status_id');
    }

    public function isApproved(): bool
    {
        return $this->moderationStatus?->name === 'aprobado';
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'rated_at' => 'datetime',
        ];
    }
}
