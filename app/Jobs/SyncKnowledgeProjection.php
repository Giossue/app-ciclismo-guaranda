<?php

namespace App\Jobs;

use App\Services\Ai\KnowledgeProjectionSynchronizer;
use Illuminate\Contracts\Queue\ShouldBeUniqueUntilProcessing;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class SyncKnowledgeProjection implements ShouldBeUniqueUntilProcessing, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    public int $timeout = 45;

    public function __construct(public readonly bool $force = false) {}

    public function uniqueId(): string
    {
        return 'knowledge-projection';
    }

    public function handle(KnowledgeProjectionSynchronizer $synchronizer): void
    {
        if (! $synchronizer->configured()) {
            return;
        }

        $result = $synchronizer->sync($this->force);

        Log::info('Knowledge projection synchronized', $result);
    }

    public function failed(?Throwable $exception): void
    {
        Log::warning('Knowledge projection synchronization failed', [
            'exception' => $exception?->class,
        ]);
    }
}
