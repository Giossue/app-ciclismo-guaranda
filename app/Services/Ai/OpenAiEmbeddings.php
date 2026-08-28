<?php

namespace App\Services\Ai;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;
use RuntimeException;

class OpenAiEmbeddings
{
    public const DIMENSIONS = 3072;

    public function configured(): bool
    {
        return filled(config('guaranda.assistant.openai.api_key'))
            && filled(config('guaranda.assistant.openai.embedding_model'))
            && $this->dimensions() === self::DIMENSIONS;
    }

    public function model(): string
    {
        $model = config('guaranda.assistant.openai.embedding_model', 'text-embedding-3-large');

        if (! is_string($model) || $model === '') {
            throw new RuntimeException('OpenAI embeddings model is not configured.');
        }

        return $model;
    }

    /**
     * @param  list<string>  $inputs
     * @return list<list<float>>
     *
     * @throws ConnectionException|RuntimeException
     */
    public function embed(array $inputs): array
    {
        if (! $this->configured()) {
            throw new RuntimeException('OpenAI embeddings are not configured.');
        }

        $inputs = array_values($inputs);

        if ($inputs === [] || count($inputs) > 100) {
            throw new InvalidArgumentException('Embedding batches must contain between 1 and 100 documents.');
        }

        foreach ($inputs as $input) {
            if (trim($input) === '' || mb_strlen($input) > 20_000) {
                throw new InvalidArgumentException('Each knowledge document must contain between 1 and 20000 characters.');
            }
        }

        $startedAt = hrtime(true);
        $response = Http::baseUrl('https://api.openai.com/v1')
            ->withToken((string) config('guaranda.assistant.openai.api_key'))
            ->acceptJson()
            ->asJson()
            ->connectTimeout(max(1, (int) config('guaranda.assistant.openai.connect_timeout_seconds', 3)))
            ->timeout(max(1, (int) config('guaranda.assistant.openai.timeout_seconds', 20)))
            ->retry([200, 500])
            ->post('/embeddings', [
                'model' => $this->model(),
                'input' => $inputs,
                'dimensions' => self::DIMENSIONS,
                'encoding_format' => 'float',
            ]);

        $json = $response->throw()->json();
        $embeddings = collect(Arr::get($json, 'data', []))
            ->filter(fn (mixed $item): bool => is_array($item) && is_int($item['index'] ?? null) && is_array($item['embedding'] ?? null))
            ->sortBy('index')
            ->map(fn (array $item): array => $this->validatedEmbedding($item['embedding']))
            ->values()
            ->all();

        if (count($embeddings) !== count($inputs)) {
            throw new RuntimeException('OpenAI returned an incomplete embeddings response.');
        }

        Log::info('OpenAI embeddings completed', [
            'model' => is_string(Arr::get($json, 'model')) ? Arr::get($json, 'model') : $this->model(),
            'documents' => count($inputs),
            'latency_ms' => (int) ((hrtime(true) - $startedAt) / 1_000_000),
            'prompt_tokens' => is_int(Arr::get($json, 'usage.prompt_tokens')) ? Arr::get($json, 'usage.prompt_tokens') : null,
        ]);

        return $embeddings;
    }

    private function dimensions(): int
    {
        return (int) config('guaranda.assistant.openai.embedding_dimensions', self::DIMENSIONS);
    }

    /**
     * @param  array<int, mixed>  $embedding
     * @return list<float>
     */
    private function validatedEmbedding(array $embedding): array
    {
        if (count($embedding) !== self::DIMENSIONS) {
            throw new RuntimeException('OpenAI returned an embedding with an unexpected dimension.');
        }

        return array_map(function (mixed $value): float {
            if (! is_numeric($value) || ! is_finite((float) $value)) {
                throw new RuntimeException('OpenAI returned an invalid embedding value.');
            }

            return (float) $value;
        }, $embedding);
    }
}
