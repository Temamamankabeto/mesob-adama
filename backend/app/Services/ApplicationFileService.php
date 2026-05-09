<?php

namespace App\Services;

use App\Models\ServiceApplication;
use App\Models\ServiceApplicationFile;
use App\Models\User;
use Illuminate\Http\UploadedFile;

class ApplicationFileService
{
    public function storeFiles(
        ServiceApplication $application,
        array $files,
        ?User $user = null
    ): void {
        foreach ($files as $fieldName => $file) {
            if (!$file instanceof UploadedFile) {
                continue;
            }

            $path = $file->store(
                'service-applications',
                'public'
            );

            ServiceApplicationFile::create([
                'application_id' => $application->id,
                'field_name' => $fieldName,
                'original_name' => $file->getClientOriginalName(),
                'stored_name' => basename($path),
                'path' => $path,
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'uploaded_by' => $user?->id,
            ]);
        }
    }
}