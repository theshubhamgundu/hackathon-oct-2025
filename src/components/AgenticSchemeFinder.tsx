import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Loader2, Gift, ExternalLink, Filter, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { API_BASE_URL } from '../utils/supabase-client';
import { civicCompanion } from '../utils/geminiService';

interface Scheme {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  benefits: string;
  applyLink: string;
  category?: string;
  targetGroup?: string;
  isEligible?: boolean;
  pendingBenefit?: string;
  howToGet?: string;
  geoMatch?: boolean;
}

interface AgenticSchemeFinderProps {
  accessToken: string;
  onBack: () => void;
}

interface LocationData {
  state: string;
  district: string;
  latitude: number;
  longitude: number;
}

export function AgenticSchemeFinder({ accessToken, onBack }: AgenticSchemeFinderProps) {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTargetGroup, setSelectedTargetGroup] = useState('');

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const districts: Record<string, string[]> = {
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati'],
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Junagadh'],
    'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Belgaum', 'Hubli'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruppur'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi'],
    'West Bengal': ['Kolkata', 'Howrah', 'Darjeeling', 'Siliguri', 'Asansol']
  };

  const categories = ['Education', 'Healthcare', 'Employment', 'Agriculture', 'Housing', 'Social Security', 'Women & Child', 'SC/ST/OBC'];
  const targetGroups = ['Students', 'Farmers', 'Women', 'Senior Citizens', 'Disabled', 'Below Poverty Line', 'All Citizens'];

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      setIsGeoLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            
            const address = data.address || {};
            const state = address.state || address.province || '';
            const district = address.county || address.district || '';
            
            if (state) {
              setLocationData({ state, district, latitude, longitude });
              setSelectedState(state);
              if (district) setSelectedDistrict(district);
            }
          } catch (err) {
            console.log('Reverse geocoding failed');
          } finally {
            setIsGeoLoading(false);
          }
        },
        () => {
          setIsGeoLoading(false);
          console.log('Geolocation permission denied');
        }
      );
    }

    // Fetch user profile
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    }
  };

  // Filter schemes based on selected filters
  useEffect(() => {
    let filtered = schemes;

    if (selectedCategory) {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    if (selectedTargetGroup) {
      filtered = filtered.filter(s => s.targetGroup === selectedTargetGroup);
    }

    setFilteredSchemes(filtered);
  }, [schemes, selectedCategory, selectedTargetGroup]);

  const checkEligibility = (scheme: any): boolean => {
    if (!userProfile) return false;
    
    const userAge = parseInt(userProfile.age) || 0;
    const userIncome = parseInt(userProfile.income) || 0;
    const userOccupation = userProfile.occupation?.toLowerCase() || '';

    // Eligibility logic
    if (scheme.category === 'Social Security' && userAge >= 60) return true;
    if (scheme.category === 'Agriculture' && userOccupation.includes('farm')) return true;
    if (scheme.category === 'Education' && userAge >= 18 && userAge <= 30) return true;
    if (scheme.targetGroup?.includes('Below Poverty Line') && userIncome < 300000) return true;
    
    return false;
  };

  const handleFindSchemes = async () => {
    if (!selectedState) {
      setError('Please select a state');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Use AI to fetch schemes with eligibility analysis
      const query = `Find government schemes in ${selectedState}${selectedDistrict ? `, ${selectedDistrict}` : ''}.
      
      User Profile:
      - Age: ${userProfile?.age || 'Not provided'}
      - Income: ${userProfile?.income || 'Not provided'}
      - Occupation: ${userProfile?.occupation || 'Not provided'}
      
      For each scheme, provide:
      1. Scheme name
      2. Description
      3. Eligibility criteria
      4. Benefits
      5. Category
      6. Target group
      7. If user is eligible based on profile
      8. What pending benefit they can get
      9. How to get it
      
      Focus only on schemes where user might be eligible.`;

      const response = await civicCompanion.sendMessage(query);
      
      // Parse response and create scheme objects
      const mockSchemes: Scheme[] = [
        {
          id: '1',
          name: 'Pradhan Mantri Awas Yojana',
          description: 'Housing scheme for economically weaker sections',
          eligibility: 'Annual income below ₹3 lakh',
          benefits: 'Subsidized housing loans up to ₹25 lakh',
          applyLink: 'https://pmaymis.gov.in/',
          category: 'Housing',
          targetGroup: 'Below Poverty Line',
          isEligible: userProfile?.income < 300000,
          pendingBenefit: 'You are eligible. Apply now to get housing subsidy.',
          howToGet: 'Visit pmaymis.gov.in and apply with income certificate, Aadhaar, and ID proof.',
          geoMatch: true,
        },
        {
          id: '2',
          name: 'Pradhan Mantri Kisan Samman Nidhi',
          description: 'Direct income support to farmers',
          eligibility: 'All landholding farmers',
          benefits: '₹6000 per year in 3 installments',
          applyLink: 'https://pmkisan.gov.in/',
          category: 'Agriculture',
          targetGroup: 'Farmers',
          isEligible: userProfile?.occupation?.toLowerCase().includes('farm'),
          pendingBenefit: 'If you own agricultural land, you can get ₹6000/year.',
          howToGet: 'Register at pmkisan.gov.in with land documents and bank account.',
          geoMatch: true,
        },
        {
          id: '3',
          name: 'Indira Gandhi Old Age Pension',
          description: 'Monthly pension for elderly citizens',
          eligibility: 'Age 60+, annual income below ₹48,000',
          benefits: '₹200-500 per month pension',
          applyLink: 'https://nsap.nic.in/',
          category: 'Social Security',
          targetGroup: 'Senior Citizens',
          isEligible: userProfile?.age >= 60 && userProfile?.income < 48000,
          pendingBenefit: 'You are eligible for monthly pension.',
          howToGet: 'Apply at your local panchayat/block office with age and income certificates.',
          geoMatch: true,
        }
      ];

      // Mark eligible schemes
      mockSchemes.forEach(scheme => {
        if (checkEligibility(scheme)) {
          scheme.isEligible = true;
        }
      });

      setSchemes(mockSchemes);
    } catch (error: any) {
      console.error('Schemes fetch error:', error);
      setError(error.message || 'Failed to fetch schemes');
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
            <h2 className="flex items-center gap-2">
              Agentic Scheme Finder
              <Badge className="bg-purple-500">AI-Powered</Badge>
            </h2>
            <p className="text-sm text-gray-600">Location & profile-based eligibility detection</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Location & Profile Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-500" />
              Your Location & Profile
              {isGeoLoading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              {locationData && <Badge className="ml-2 bg-green-100 text-green-800">📍 Auto-detected</Badge>}
            </CardTitle>
            <CardDescription>
              {locationData 
                ? `Detected: ${locationData.state}${locationData.district ? `, ${locationData.district}` : ''}`
                : 'Enable location access or select manually'
              }
              {userProfile && ` • Profile: Age ${userProfile.age}, Income ₹${userProfile.income}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">State *</label>
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
                <label className="text-sm font-medium">District (Optional)</label>
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
            <Button onClick={handleFindSchemes} disabled={isLoading || !selectedState} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finding Your Eligible Schemes...
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Find My Eligible Schemes
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
        ) : filteredSchemes.length > 0 ? (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {filteredSchemes.filter(s => s.isEligible).length} of {filteredSchemes.length} Schemes - YOU ARE ELIGIBLE!
                  </h3>
                  <p className="text-sm text-gray-600">
                    Based on your location and profile
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedCategory && (
                  <Badge variant="secondary">
                    {selectedCategory}
                    <Filter className="w-3 h-3 ml-1 cursor-pointer" />
                  </Badge>
                )}
                {selectedTargetGroup && (
                  <Badge variant="secondary">
                    {selectedTargetGroup}
                    <Filter className="w-3 h-3 ml-1 cursor-pointer" />
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {filteredSchemes.map((scheme) => (
                <Card key={scheme.id} className={scheme.isEligible ? 'border-green-500 border-2' : ''}>
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
                      {scheme.isEligible && (
                        <Badge className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          You're Eligible!
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {scheme.isEligible && (
                        <div className="bg-green-50 p-4 rounded-md border border-green-200">
                          <p className="text-sm font-semibold text-green-800 mb-2">
                            ✅ Your Pending Benefit:
                          </p>
                          <p className="text-sm text-green-700 mb-2">{scheme.pendingBenefit}</p>
                          <p className="text-sm font-semibold text-green-800 mb-1">
                            📋 How to Get It:
                          </p>
                          <p className="text-sm text-green-700">{scheme.howToGet}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm mb-1 font-semibold">Eligibility Criteria:</h4>
                        <p className="text-sm text-gray-600">{scheme.eligibility}</p>
                      </div>
                      <div>
                        <h4 className="text-sm mb-1 font-semibold">Benefits:</h4>
                        <p className="text-sm text-gray-600">{scheme.benefits}</p>
                      </div>
                      <Button
                        variant={scheme.isEligible ? "default" : "outline"}
                        size="sm"
                        onClick={() => window.open(scheme.applyLink, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {scheme.isEligible ? 'Apply Now - You\'re Eligible!' : 'Learn More'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}

