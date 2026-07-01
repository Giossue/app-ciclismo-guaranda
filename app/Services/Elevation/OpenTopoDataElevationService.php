<?php

namespace App\Services\Elevation;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class OpenTopoDataElevationService
{
    /**
     * @param  array<int, array{0: float|int|string, 1: float|int|string}>  $coordinates
     * @return array{positive_elevation_m: float, negative_elevation_m: float, sample_count: int, dataset: string}
     */
    public function calculateForLineString(array $coordinates): array
    {
        $sampledCoordinates = $this->sampleCoordinates($coordinates);

        if (count($sampledCoordinates) < 2) {
            throw new RuntimeException('La ruta necesita al menos dos puntos para calcular desnivel.');
        }

        $locations = collect($sampledCoordinates)
            ->map(fn (array $coordinate): string => $coordinate[1].','.$coordinate[0])
            ->implode('|');

        $dataset = $this->dataset();
        $response = Http::acceptJson()
            ->asJson()
            ->timeout($this->timeoutSeconds())
            ->post($this->endpointUrl($dataset), array_filter([
                'locations' => $locations,
                'interpolation' => $this->interpolation(),
            ], fn (mixed $value): bool => $value !== null && $value !== ''));

        if ($response->failed()) {
            throw new RuntimeException('OpenTopoData respondió con estado HTTP '.$response->status().'.');
        }

        $json = $response->json();

        if (! is_array($json) || Arr::get($json, 'status') !== 'OK') {
            throw new RuntimeException('OpenTopoData no devolvió una respuesta válida.');
        }

        $results = Arr::get($json, 'results');

        if (! is_array($results) || count($results) < 2) {
            throw new RuntimeException('OpenTopoData no devolvió suficientes elevaciones para la ruta.');
        }

        $elevations = collect($results)
            ->map(fn (mixed $result): ?float => is_array($result) && is_numeric($result['elevation'] ?? null)
                ? (float) $result['elevation']
                : null)
            ->filter(fn (?float $elevation): bool => $elevation !== null)
            ->values();

        if ($elevations->count() < 2) {
            throw new RuntimeException('OpenTopoData devolvió elevaciones vacías para esta geometría.');
        }

        $positive = 0.0;
        $negative = 0.0;
        $previous = $elevations->first();

        foreach ($elevations->skip(1) as $current) {
            $delta = $current - $previous;

            if ($delta > 0) {
                $positive += $delta;
            } elseif ($delta < 0) {
                $negative += abs($delta);
            }

            $previous = $current;
        }

        return [
            'positive_elevation_m' => round($positive, 2),
            'negative_elevation_m' => round($negative, 2),
            'sample_count' => $elevations->count(),
            'dataset' => $dataset,
        ];
    }

    /**
     * @param  array<int, array{0: float|int|string, 1: float|int|string}>  $coordinates
     * @return list<array{0: float, 1: float}>
     */
    private function sampleCoordinates(array $coordinates): array
    {
        /** @var list<array{0: float, 1: float}> $normalized */
        $normalized = collect($coordinates)
            ->filter(fn (array $coordinate): bool => is_numeric($coordinate[0]) && is_numeric($coordinate[1]))
            ->map(fn (array $coordinate): array => [(float) $coordinate[0], (float) $coordinate[1]])
            ->values()
            ->all();

        $count = count($normalized);
        $maxSamples = $this->maxSamples();

        if ($count <= $maxSamples) {
            return $normalized;
        }

        $sampled = [];

        for ($index = 0; $index < $maxSamples; $index++) {
            $sourceIndex = (int) round($index * ($count - 1) / ($maxSamples - 1));
            $sampled[] = $normalized[$sourceIndex];
        }

        return $sampled;
    }

    private function endpointUrl(string $dataset): string
    {
        $baseUrl = rtrim((string) config('guaranda.elevation.opentopodata.base_url', 'https://api.opentopodata.org'), '/');

        return $baseUrl.'/v1/'.$dataset;
    }

    private function dataset(): string
    {
        $dataset = (string) config('guaranda.elevation.opentopodata.dataset', 'srtm90m');

        if (! preg_match('/^[A-Za-z0-9_,.-]+$/', $dataset)) {
            throw new RuntimeException('Dataset de OpenTopoData inválido.');
        }

        return $dataset;
    }

    private function interpolation(): ?string
    {
        $interpolation = config('guaranda.elevation.opentopodata.interpolation', 'bilinear');

        return is_string($interpolation) && $interpolation !== '' ? $interpolation : null;
    }

    private function timeoutSeconds(): int
    {
        return max(1, (int) config('guaranda.elevation.opentopodata.timeout_seconds', 15));
    }

    private function maxSamples(): int
    {
        return min(100, max(2, (int) config('guaranda.elevation.opentopodata.max_samples', 100)));
    }
}
