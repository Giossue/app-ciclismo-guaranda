<?php

use App\Models\AiAssistantSetting;
use App\Models\User;
use App\Services\Ai\AssistantConfiguration;
use Illuminate\Support\Facades\Cache;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Cache::forget('ai:assistant:configuration');
});

test('administrator can configure an allowlisted GPT-5.6 chat model and effort', function () {
    $this->withoutVite();

    $admin = User::factory()->administrator()->create();

    $this->actingAs($admin)
        ->patch(route('admin.settings.assistant.update'), [
            'chat_model' => 'gpt-5.6-terra',
            'chat_reasoning_effort' => 'high',
        ])
        ->assertRedirect(route('admin.settings.index'))
        ->assertSessionHas('success');

    $setting = AiAssistantSetting::query()->findOrFail(1);

    expect($setting->chat_model)->toBe('gpt-5.6-terra')
        ->and($setting->chat_reasoning_effort)->toBe('high')
        ->and(app(AssistantConfiguration::class)->chat())->toBe([
            'model' => 'gpt-5.6-terra',
            'reasoning_effort' => 'high',
        ]);
});

test('assistant model settings are shown to administrators without exposing the OpenAI key', function () {
    $this->withoutVite();
    config(['guaranda.assistant.openai.api_key' => 'openai-key-that-must-not-leak']);

    $admin = User::factory()->administrator()->create();

    $this->actingAs($admin)
        ->get(route('admin.settings.index'))
        ->assertOk()
        ->assertDontSee('openai-key-that-must-not-leak', false)
        ->assertInertia(fn (Assert $page) => $page
            ->where('assistantConfiguration.chat_model', 'gpt-5.6-luna')
            ->where('assistantConfiguration.chat_reasoning_effort', 'medium')
            ->where('assistantConfiguration.vision_model', 'gpt-5.6-luna')
            ->where('assistantConfiguration.vision_reasoning_effort', 'none'));
});

test('cyclists cannot update assistant configuration', function () {
    $cyclist = User::factory()->cyclist()->create();

    $this->actingAs($cyclist)
        ->patch(route('admin.settings.assistant.update'), [
            'chat_model' => 'gpt-5.6-sol',
            'chat_reasoning_effort' => 'max',
        ])
        ->assertForbidden();
});

test('administrator cannot persist an unsupported model or effort', function () {
    $admin = User::factory()->administrator()->create();

    $this->actingAs($admin)
        ->from(route('admin.settings.index'))
        ->patch(route('admin.settings.assistant.update'), [
            'chat_model' => 'arbitrary-model',
            'chat_reasoning_effort' => 'very much',
        ])
        ->assertRedirect(route('admin.settings.index'))
        ->assertSessionHasErrors(['chat_model', 'chat_reasoning_effort']);
});
