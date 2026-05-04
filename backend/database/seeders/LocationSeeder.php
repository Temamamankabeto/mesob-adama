<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\City;
use App\Models\Subcity;
use App\Models\Woreda;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $city = City::create(['name' => 'Adama', 'code' => 'AD']);

        $sub1 = Subcity::create(['city_id' => $city->id, 'name' => 'Subcity 01']);
        $sub2 = Subcity::create(['city_id' => $city->id, 'name' => 'Subcity 02']);

        Woreda::create(['city_id' => $city->id, 'subcity_id' => $sub1->id, 'name' => 'Woreda 01']);
        Woreda::create(['city_id' => $city->id, 'subcity_id' => $sub1->id, 'name' => 'Woreda 02']);
        Woreda::create(['city_id' => $city->id, 'subcity_id' => $sub2->id, 'name' => 'Woreda 03']);
    }
}
