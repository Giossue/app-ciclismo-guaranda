<?php

namespace App\Services\Ai;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class OpenAiImageDescriber
{
    public function __construct(private readonly AssistantConfiguration $configuration) {}

    public function configured(): bool
    {
        return $this->apiKey() !== null && $this->model() !== null;
    }

    /**
     * @throws ConnectionException|RuntimeException
     */
    public function describe(string $path): string
    {
        $apiKey = $this->apiKey();
        $model = $this->model();

        if ($apiKey === null || $model === null) {
            throw new RuntimeException('OpenAI image description is not configured.');
        }

        $disk = Storage::disk('public');

        if (! $disk->exists($path)) {
            throw new RuntimeException('Managed image file no longer exists.');
        }

        $maxBytes = max(1, (int) config('guaranda.assistant.openai.vision_max_image_bytes', 5 * 1024 * 1024));
        $size = $disk->size($path);

        if ($size === false || $size < 1 || $size > $maxBytes) {
            throw new RuntimeException('Managed image size is outside the permitted limit.');
        }

        $mimeType = $disk->mimeType($path);

        if (! in_array($mimeType, ['image/jpeg', 'image/png', 'image/webp'], true)) {
            throw new RuntimeException('Managed image format is not supported for vision.');
        }

        $contents = $disk->get($path);

        if (! is_string($contents) || $contents === '') {
            throw new RuntimeException('Managed image cannot be read.');
        }

        $startedAt = hrtime(true);

        $response = Http::baseUrl('https://api.openai.com/v1')
            ->withToken($apiKey)
            ->acceptJson()
            ->asJson()
            ->connectTimeout(max(1, (int) config('guaranda.assistant.openai.connect_timeout_seconds', 3)))
            ->timeout(max(1, (int) config('guaranda.assistant.openai.timeout_seconds', 20)))
            ->post('/responses', [
                'model' => $model,
                'store' => false,
                'reasoning' => ['effort' => $this->configuration->vision()['reasoning_effort']],
                'max_output_tokens' => 180,
                'instructions' => 'Escribe una descripción accesible, objetiva y breve en español para una imagen editorial de Guaranda Go. No identifiques personas, no infieras datos sensibles, no inventes ubicaciones ni datos que no se vean. Devuelve solamente el JSON solicitado.',
                'text' => [
                    'format' => [
                        'type' => 'json_schema',
                        'name' => 'guaranda_image_description',
                        'strict' => true,
                        'schema' => [
                            'type' => 'object',
                            'properties' => [
                                'description' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 280],
                            ],
                            'required' => ['description'],
                            'additionalProperties' => false,
                        ],
                    ],
                ],
                'input' => [[
                    'role' => 'user',
                    'content' => [
                        ['type' => 'input_text', 'text' => 'Describe esta imagen para texto alternativo y contexto turístico editorial.'],
                        [
                            'type' => 'input_image',
                            'image_url' => "data:{$mimeType};base64,".base64_encode($contents),
                            'detail' => 'low',
                        ],
                    ],
                ]],
            ]);

        $json = $response->throw()->json();

        if (! is_array($json) || Arr::get($json, 'status') !== 'completed') {
            throw new RuntimeException('OpenAI returned an incomplete image description.');
        }

        $outputText = collect(Arr::get($json, 'output', []))
            ->filter(fn (mixed $item): bool => is_array($item) && Arr::get($item, 'type') === 'message')
            ->flatMap(fn (array $item) => Arr::get($item, 'content', []))
            ->filter(fn (mixed $part): bool => is_array($part) && Arr::get($part, 'type') === 'output_text')
            ->pluck('text')
            ->filter(fn (mixed $text): bool => is_string($text) && trim($text) !== '')
            ->first();

        if (! is_string($outputText)) {
            throw new RuntimeException('OpenAI returned no usable image description.');
        }

        $decoded = json_decode($outputText, true, 512, JSON_THROW_ON_ERROR);
        $description = is_array($decoded) ? ($decoded['description'] ?? null) : null;

        if (! is_string($description) || trim($description) === '') {
            throw new RuntimeException('OpenAI returned an invalid image description.');
        }

        Log::info('OpenAI image description completed', [
            'model' => is_string(Arr::get($json, 'model')) ? Arr::get($json, 'model') : $model,
            'latency_ms' => (int) ((hrtime(true) - $startedAt) / 1_000_000),
            'input_tokens' => $this->usageValue($json, 'input_tokens'),
            'output_tokens' => $this->usageValue($json, 'output_tokens'),
        ]);

        return mb_substr(trim($description), 0, 280);
    }

    private function apiKey(): ?string
    {
        $key = config('guaranda.assistant.openai.api_key');

        return is_string($key) && $key !== '' ? $key : null;
    }

    private function model(): ?string
    {
        return $this->configuration->vision()['model'];
    }

    /**
     * @param  array<string, mixed>  $response
     */
    private function usageValue(array $response, string $key): ?int
    {
        $value = Arr::get($response, "usage.{$key}");

        return is_int($value) ? $value : null;
    }
}
