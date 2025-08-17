<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    protected $with = ['role'];


     public function role()
    {
        return $this->belongsTo(Role::class);
    }
     public function roles()
    {
        return $this->belongsTo(Role::class);
    }

    public function student(): HasOne
    {
        return $this->hasOne(Student::class);
    }

    public function teacher(): HasOne
    {
        return $this->hasOne(Teacher::class);
    }

    public function hasRole($roles): bool
    {
        if (is_string($roles)) {
            return $this->role->name === $roles;
        }

        if (is_array($roles)) {
            return in_array($this->role->name, $roles);
        }

        return false;
    }

    public function isAdmin(): bool
    {
        return $this->role->name === 'admin';
    }

    public function isTeacher(): bool
    {
        return $this->role->name === 'teacher';
    }

    public function isStudent(): bool
    {
        return $this->role->name === 'student';
    }
}
