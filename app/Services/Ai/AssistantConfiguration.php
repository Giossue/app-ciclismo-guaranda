<?php

namespace App\Services\Ai;

use App\Models\AiAssistantSetting;
use Illuminate\Support\Facades\Cache;

class AssistantConfiguration
{
    /** @var list<string> */
    public const CHAT_MODELS = [
        'gpt-5.6-luna',
        'gpt-5.6-terra',
        'gpt-5.6-sol',
    ];

    /** @var list<string> */
    public const REASONING_EFFORTS = [
        'none',
        'low',
        'medium',
        'high',
        'xhigh',
        'max',
    ];

    private const CACHE_KEY = 'ai:assistant:configuration';

    /**
     * @return array{model: string|null, reasoning_effort: string}
     */
    public function chat(): array
    {
        $setting = $this->setting();
        $defaultModel = config('guaranda.assistant.openai.model');
        $defaultEffort = config('guaranda.assistant.openai.reasoning_effort', 'medium');

        return [
            'model' => $this->allowedModel($setting?->chat_model) ?? $this->configuredModel($defaultModel),
            'reasoning_effort' => $this->allowedEffort($setting?->chat_reasoning_effort)
                ?? $this->allowedEffort($defaultEffort)
                ?? 'medium',
        ];
    }

    /**
     * @return array{model: string|null, reasoning_effort: string}
     */
    public function vision(): array
    {
        return [
            'model' => $this->configuredModel(config('guaranda.assistant.openai.vision_model')),
            'reasoning_effort' => $this->allowedEffort(config('guaranda.assistant.openai.vision_reasoning_effort')) ?? 'none',
        ];
    }

    /**
     * @param  array{chat_model: string, chat_reasoning_effort: string}  $attributes
     */
    public function update(array $attributes): AiAssistantSetting
    {
        $setting = AiAssistantSetting::query()->updateOrCreate(['id' => 1], $attributes);

        Cache::forget(self::CACHE_KEY);

        return $setting;
    }

    public function configuredForChat(): bool
    {
        return filled(config('guaranda.assistant.openai.api_key')) && $this->chat()['model'] !== null;
    }

    public function configuredForVision(): bool
    {
        return filled(config('guaranda.assistant.openai.api_key')) && $this->vision()['model'] !== null;
    }

    private function setting(): ?AiAssistantSetting
    {
        return Cache::remember(self::CACHE_KEY, now()->addMinutes(5), fn (): ?AiAssistantSetting => AiAssistantSetting::query()->find(1));
    }

    private function allowedModel(mixed $model): ?string
    {
        return is_string($model) && in_array($model, self::CHAT_MODELS, true) ? $model : null;
    }

    private function allowedEffort(mixed $effort): ?string
    {
        return is_string($effort) && in_array($effort, self::REASONING_EFFORTS, true) ? $effort : null;
    }

    private function configuredModel(mixed $model): ?string
    {
        return is_string($model) && $model !== '' ? $model : null;
    }
}
