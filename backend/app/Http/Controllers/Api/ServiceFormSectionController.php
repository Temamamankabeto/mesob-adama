<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceFormSection;
use Illuminate\Http\Request;

class ServiceFormSectionController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => ServiceFormSection::with('form')
                ->latest()
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_form_id' => ['required', 'exists:service_forms,id'],
            'title' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $section = ServiceFormSection::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Section created successfully',
            'data' => $section->load('form'),
        ]);
    }

    public function show(ServiceFormSection $serviceFormSection)
    {
        return response()->json([
            'success' => true,
            'data' => $serviceFormSection->load('form'),
        ]);
    }

    public function update(Request $request, ServiceFormSection $serviceFormSection)
    {
        $validated = $request->validate([
            'title' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $serviceFormSection->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Section updated successfully',
            'data' => $serviceFormSection->load('form'),
        ]);
    }

    public function destroy(ServiceFormSection $serviceFormSection)
    {
        $serviceFormSection->delete();

        return response()->json([
            'success' => true,
            'message' => 'Section deleted successfully',
        ]);
    }
}
