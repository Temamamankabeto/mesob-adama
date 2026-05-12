<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceFormSection;
use Illuminate\Http\Request;

class ServiceFormSectionController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | LIST
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $sections = ServiceFormSection::with('fields')
            ->when(
                $request->service_form_id,
                fn ($query) =>
                $query->where(
                    'service_form_id',
                    $request->service_form_id
                )
            )
            ->orderBy('sort_order')
            ->paginate(
                $request->get('per_page', 10)
            );

        return response()->json([
            'success' => true,
            'message' => 'Sections retrieved successfully',
            'data' => $sections->items(),
            'meta' => [
                'current_page' => $sections->currentPage(),
                'per_page' => $sections->perPage(),
                'total' => $sections->total(),
                'last_page' => $sections->lastPage(),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | STORE
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_form_id' => ['required', 'exists:service_forms,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $section = ServiceFormSection::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Section created successfully',
            'data' => $section,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | SHOW
    |--------------------------------------------------------------------------
    */

    public function show(ServiceFormSection $serviceFormSection)
    {
        return response()->json([
            'success' => true,
            'data' => $serviceFormSection,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        ServiceFormSection $serviceFormSection
    ) {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
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

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */

    public function destroy(ServiceFormSection $serviceFormSection)
    {
        $serviceFormSection->delete();

        return response()->json([
            'success' => true,
            'message' => 'Section deleted successfully',
            'data' => null,
        ]);
    }
}