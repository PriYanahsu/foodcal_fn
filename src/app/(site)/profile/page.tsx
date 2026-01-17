'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

interface ProfileData {
  username: string;
  full_name: string;
  email: string;
  gender: string;
  age: number | '';
  height: number | '';
  weight: number | '';
  activity_level: string;
  goal: string;
}

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    username: '',
    full_name: '',
    email: '',
    gender: '',
    age: '',
    height: '',
    weight: '',
    activity_level: 'Sedentary',
    goal: 'Maintain Weight',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfile({
          username: data.username || '',
          full_name: data.full_name || '',
          email: user?.email || '',
          gender: data.gender || 'Male',
          age: data.age || '',
          height: data.height || '',
          weight: data.weight || '',
          activity_level: data.activity_level || 'Sedentary',
          goal: data.goal || 'Maintain Weight',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const updates = {
        updated_at: new Date().toISOString(),
        full_name: profile.full_name,
        // username is usually immutable or requires check, keeping it read-only for now or simple update
        // gender is editable
        gender: profile.gender,
        age: profile.age === '' ? null : Number(profile.age),
        height: profile.height === '' ? null : Number(profile.height),
        weight: profile.weight === '' ? null : Number(profile.weight),
        activity_level: profile.activity_level,
        goal: profile.goal,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);

      if (error) throw error;
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">Profile</h1>
        <Button variant="outline" onClick={logout} className="text-red-400 hover:text-red-300 border-red-500/30 hover:bg-red-500/10">
          Sign Out
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* User Card */}
        <Card className="md:col-span-1 p-6 bg-[var(--card-bg)] border border-[var(--card-border)] flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-4xl font-bold text-black border-4 border-[var(--background)] shadow-xl">
            {profile.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile.full_name || 'User'}</h2>
            <p className="text-[var(--text-muted)]">@{profile.username || 'username'}</p>
          </div>
          <div className="w-full pt-4 border-t border-[var(--card-border)]">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-[var(--text-muted)]">Joined</span>
                <span className="font-medium">2026</span>
              </div>
              <div>
                <span className="block text-[var(--text-muted)]">Logs</span>
                <span className="font-medium">-</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Details Form */}
        <Card className="md:col-span-2 p-8 bg-[var(--card-bg)] border border-[var(--card-border)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Personal Details</h3>
            <Button
              variant="primary"
              onClick={() => setIsEditing(!isEditing)}
              className="text-[var(--primary)]"
            >
              {isEditing ? 'Cancel' : 'Edit Details'}
            </Button>
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Full Name</label>
                <Input
                  value={profile.full_name}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Gender</label>
                <select
                  disabled={!isEditing}
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Age</label>
                <Input
                  type="number"
                  value={profile.age}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value === '' ? '' : Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Height (cm)</label>
                <Input
                  type="number"
                  value={profile.height}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, height: e.target.value === '' ? '' : Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Weight (kg)</label>
                <Input
                  type="number"
                  value={profile.weight}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, weight: e.target.value === '' ? '' : Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Goal</label>
                <select
                  disabled={!isEditing}
                  value={profile.goal}
                  onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50"
                >
                  <option value="Lose Weight">Lose Weight</option>
                  <option value="Maintain Weight">Maintain Weight</option>
                  <option value="Gain Muscle">Gain Muscle</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Activity Level</label>
              <select
                disabled={!isEditing}
                value={profile.activity_level}
                onChange={(e) => setProfile({ ...profile, activity_level: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50"
              >
                <option value="Sedentary">Sedentary (Office Job)</option>
                <option value="Lightly Active">Lightly Active (1-2 days/week)</option>
                <option value="Moderately Active">Moderately Active (3-5 days/week)</option>
                <option value="Very Active">Very Active (6+ days/week)</option>
              </select>
            </div>

            {isEditing && (
              <div className="flex justify-end pt-4">
                <Button onClick={handleUpdate} isLoading={saving} variant="primary">
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>


    </div>
  );
}
