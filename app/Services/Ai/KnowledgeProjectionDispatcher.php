<?php

namespace App\Services\Ai;

use App\Jobs\SyncKnowledgeProjection;

class KnowledgeProjectionDispatcher
{
    public function __construct(private readonly AssistantConfiguration $configuration) {}

    public function afterCommit(): void
    {
        if (! $this->configuration->configuredForEmbeddings()) {
            return;
        }

        SyncKnowledgeProjection::dispatch()->afterCommit();
    }
}
