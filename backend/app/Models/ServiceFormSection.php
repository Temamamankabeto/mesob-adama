<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceFormSection extends Model {
    use HasFactory;
    protected $fillable = ['service_form_id','title','description','sort_order','is_active'];

    public function form(){ return $this->belongsTo(ServiceForm::class,'service_form_id'); }
    public function fields(){ return $this->hasMany(ServiceFormField::class,'section_id'); }
}
