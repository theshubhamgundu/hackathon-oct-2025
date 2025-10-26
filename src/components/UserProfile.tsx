import { useState, useEffect } from 'react';
import { ArrowLeft, User, Loader2, Save, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { API_BASE_URL } from '../utils/supabase-client';

interface UserProfileProps {
  accessToken: string;
  onBack: () => void;
}

interface Profile {
  id: string;
  email: string;
  name: string;
  age: number | null;
  occupation: string | null;
  income: number | null;
  location: string | null;
}

export function UserProfile({ accessToken, onBack }: UserProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      setProfile(data.profile);
    } catch (error: any) {
      console.error('Fetch profile error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const updates = {
      name: formData.get('name') as string,
      age: formData.get('age') ? parseInt(formData.get('age') as string) : null,
      occupation: formData.get('occupation') as string || null,
      income: formData.get('income') ? parseInt(formData.get('income') as string) : null,
      location: formData.get('location') as string || null
    };

    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setProfile(data.profile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Update profile error:', error);
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div>
            <h2>User Profile</h2>
            <p className="text-sm text-gray-600">Manage your account information</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : profile ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your profile details to get personalized scheme recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    defaultValue={profile.name}
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      defaultValue={profile.age || ''}
                      placeholder="25"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      name="occupation"
                      type="text"
                      defaultValue={profile.occupation || ''}
                      placeholder="Student, Farmer, etc."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="income">Annual Income (₹)</Label>
                  <Input
                    id="income"
                    name="income"
                    type="number"
                    defaultValue={profile.income || ''}
                    placeholder="300000"
                  />
                  <p className="text-xs text-gray-500">
                    Used to determine scheme eligibility
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">City/District</Label>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    defaultValue={profile.location || ''}
                    placeholder="e.g., Patna, Bihar"
                  />
                </div>
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    <span>Profile updated successfully!</span>
                  </div>
                )}
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="mb-2">Failed to load profile</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchProfile}>Try Again</Button>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-indigo-50 rounded-lg p-6">
          <h3 className="mb-2">Why Update Your Profile?</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-1">✓</span>
              <span>Get personalized scheme recommendations based on your age, occupation, and income</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-1">✓</span>
              <span>Discover welfare benefits you're eligible for in your area</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-1">✓</span>
              <span>Receive relevant notifications about new government schemes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-1">✓</span>
              <span>Better assistance from the Civic Life Companion</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
