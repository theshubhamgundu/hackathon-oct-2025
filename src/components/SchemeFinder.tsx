import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Loader2, Gift, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { API_BASE_URL } from '../utils/supabase-client';

interface Scheme {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  benefits: string;
  applyLink: string;
}

interface SchemeFinderProps {
  accessToken: string;
  onBack: () => void;
}

export function SchemeFinder({ accessToken, onBack }: SchemeFinderProps) {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [error, setError] = useState('');

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const districts: Record<string, string[]> = {
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi'],
    'West Bengal': ['Kolkata', 'Howrah', 'Darjeeling', 'Siliguri', 'Asansol']
  };

  const handleFindSchemes = async () => {
    if (!selectedState) {
      setError('Please select a state');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/schemes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          state: selectedState,
          district: selectedDistrict
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch schemes');
      }

      setSchemes(data.schemes);
    } catch (error: any) {
      console.error('Schemes fetch error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div>
            <h2>Scheme Finder</h2>
            <p className="text-sm text-gray-600">Discover welfare schemes you're eligible for</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Location Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-500" />
              Select Your Location
            </CardTitle>
            <CardDescription>
              Choose your state and district to find relevant schemes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm">State *</label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm">District (Optional)</label>
                <Select 
                  value={selectedDistrict} 
                  onValueChange={setSelectedDistrict}
                  disabled={!selectedState || !districts[selectedState]}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your district" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedState && districts[selectedState]?.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-start gap-2 mb-4">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <Button onClick={handleFindSchemes} disabled={isLoading || !selectedState}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finding Schemes...
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Find Schemes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Schemes List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : schemes.length > 0 ? (
          <>
            <div className="mb-4">
              <h3 className="mb-1">
                {schemes.length} Schemes Available
                {selectedState && ` in ${selectedState}`}
              </h3>
              <p className="text-gray-600">
                Review eligibility criteria and apply directly through official portals
              </p>
            </div>
            <div className="space-y-4">
              {schemes.map((scheme) => (
                <Card key={scheme.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="flex items-start gap-2">
                          <Gift className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                          <span>{scheme.name}</span>
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {scheme.description}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {scheme.id.startsWith('central') ? 'Central' : 'State'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm mb-1">Eligibility:</h4>
                        <p className="text-sm text-gray-600">{scheme.eligibility}</p>
                      </div>
                      <div>
                        <h4 className="text-sm mb-1">Benefits:</h4>
                        <p className="text-sm text-gray-600">{scheme.benefits}</p>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => window.open(scheme.applyLink, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : selectedState ? (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="mb-2">No schemes found</h3>
            <p className="text-gray-600">
              Try selecting a different location or check back later
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="mb-2">Select your location</h3>
            <p className="text-gray-600">
              Choose your state to discover welfare schemes available for you
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-purple-50 rounded-lg p-6">
          <h3 className="mb-2">How Scheme Finder Works</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">1.</span>
              <span><strong>Select Location:</strong> Choose your state and optionally your district</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">2.</span>
              <span><strong>Find Schemes:</strong> JanAI fetches both central and state government schemes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">3.</span>
              <span><strong>Check Eligibility:</strong> Review requirements for each scheme</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">4.</span>
              <span><strong>Apply Online:</strong> Click "Apply Now" to visit the official portal</span>
            </li>
          </ul>
          <p className="text-sm text-gray-600 mt-4">
            💡 <strong>Tip:</strong> Update your profile with age, occupation, and income for better personalized recommendations in future updates.
          </p>
        </div>
      </main>
    </div>
  );
}
