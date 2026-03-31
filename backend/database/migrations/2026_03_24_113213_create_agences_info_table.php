<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('agences_info', function (Blueprint $table) {
            $table->id();

            // $table->unsignedBigInteger('IDAgence')->unique();
            $table->string('point_de_vente', 50)->nullable();
            $table->string('emetteur', 50)->nullable();
            $table->string('nom_ville', 120)->nullable();
            $table->integer('ville_id')->nullable();
            $table->string('ip_agence', 45)->unique()->nullable();
            $table->string('type_agence', 50)->nullable();
            $table->string('telephone_affiche', 50)->nullable();
            $table->string('etat_agence', 50)->nullable();
            $table->string('anydesk', 50)->nullable();
            $table->string('Anydesk_2', 50)->nullable();
            $table->string('Anydesk_3', 50)->nullable();
            $table->string('autres', 500)->nullable();

            $table->timestamp('last_update')->useCurrent()->useCurrentOnUpdate();

            $table->tinyInteger('type_agence_code')->nullable();
            $table->tinyInteger('etat_agence_code')->nullable();

            // Index
            $table->index('ip_agence');

            // Foreign Key
            $table->foreignId('IDAgence')
                ->unique()
                ->constrained('agences')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agences_info');
    }
};
