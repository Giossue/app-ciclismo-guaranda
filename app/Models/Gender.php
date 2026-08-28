<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

/**
 * @phpstan-type GenderOption array{id: int, name: string}
 */
class Gender extends Model
{
    public const MASCULINE = 'Masculino';

    public const FEMININE = 'Femenino';

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
        return in_array($name, self::ALLOWED_NAMES, true);
    }

    public function displayName(): string
    {
        return match ((string) $this->getAttribute('name')) {
            self::MASCULINE => self::MASCULINE,
            self::FEMININE => self::FEMININE,
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
