<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateAssistantConfigurationRequest;
use App\Models\User;
use App\Services\Ai\AssistantConfiguration;
use Illuminate\Http\RedirectResponse;

class AssistantConfigurationController extends Controller
{
    public function update(UpdateAssistantConfigurationRequest $request, AssistantConfiguration $configuration): RedirectResponse
    {
        $this->authorize('viewAny', User::class);

        $configuration->update($request->validated());

        return to_route('admin.settings.index')->with('success', 'Configuración del asistente actualizada.');
    }
}
