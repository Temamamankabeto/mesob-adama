Schema::create('announcements', function (Blueprint $table) {

    $table->id();

    $table->string('title');

    $table->text('description');

    $table->enum('status', [
        'active',
        'inactive',
    ])->default('active');

    $table->timestamps();
});