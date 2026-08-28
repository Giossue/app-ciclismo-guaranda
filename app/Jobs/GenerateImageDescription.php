<?php

namespace App\Jobs;

use App\Models\PoiImage;
use App\Models\RouteImage;
use App\Services\Ai\OpenAiImageDescriber;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;
use Throwable;

class GenerateImageDescription implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    public int $timeout = 45;

    public function __construct(
        public readonly string $kind,
        public readonly int $imageId,
    ) {
        if (! in_array($this->kind, ['route', 'poi'], true) || $this->imageId < 1) {
            throw new InvalidArgumentException('Invalid managed image reference.');
        }
    }

    public function handle(OpenAiImageDescriber $describer): void
    {
        if (! $describer->configured()) {
            return;
        }

        $image = $this->kind === 'route'
            ? RouteImage::query()->find($this->imageId)
            : PoiImage::query()->find($this->imageId);

        if ($image === null || filled($image->description)) {
            return;
        }

        $description = $describer->describe((string) $image->image_path);

        $image->newQuery()
            ->whereKey($image->id)
            ->whereNull('description')
            ->update(['description' => $description]);
    }

    public function failed(?Throwable $exception): void
    {
        Log::warning('OpenAI image description failed', [
            'kind' => $this->kind,
            'image_id' => $this->imageId,
            'exception' => $exception?->class,
        ]);
    }
}
