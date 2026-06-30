<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * @phpstan-type GenderOption array{id: int, name: string}
 */
class Gender extends Model
{
    public const MASCULINE = 'masculino';

    public const FEMININE = 'femenino';

    /**
     * @var list<string>
     */
    public const ALLOWED_NAMES = [self::MASCULINE, self::FEMININE];

    protected $table = 'generos';

    protected $guarded = ['id'];

    /**
     * @param  Builder<Gender>  $query
     * @return Builder<Gender>
     */
    public function scopeAllowed(Builder $query): Builder
    {
        return $query->whereIn('name', self::ALLOWED_NAMES);
    }

    public function isAllowed(): bool
    {
        return self::isAllowedName((string) $this->getAttribute('name'));
    }

    public static function isAllowedName(string $name): bool
    {
        return in_array(Str::lower($name), self::ALLOWED_NAMES, true);
    }

    public function displayName(): string
    {
        return match (Str::lower((string) $this->getAttribute('name'))) {
            self::MASCULINE => 'Masculino',
            self::FEMININE => 'Femenino',
            default => (string) $this->getAttribute('name'),
        };
    }

    /**
     * @return Collection<int, GenderOption>
     */
    public static function allowedOptions(): Collection
    {
        return self::query()
            ->allowed()
            ->orderBy('id')
            ->get(['id', 'name'])
            ->map(fn (Gender $gender): array => [
                'id' => (int) $gender->getKey(),
                'name' => $gender->displayName(),
            ])
            ->values();
    }
}
