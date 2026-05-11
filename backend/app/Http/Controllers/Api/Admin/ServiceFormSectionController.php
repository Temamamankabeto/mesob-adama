<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceFormSection;
use Illuminate\Http\Request;

class ServiceFormSectionController extends Controller
{
    public function index() {
        return response()->json(ServiceFormSection::with('fields')->orderBy('sort_order')->get());
    }

    public function store(Request $request) {
        $data = $request->validate([
            'service_form_id' => 'required|exists:service_forms,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Section created successfully',
            'data' => ServiceFormSection::create($data)
        ]);
    }
}
