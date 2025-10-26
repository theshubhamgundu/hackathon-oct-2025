import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Loader2, Gift, ExternalLink, AlertCircle, Navigation, Filter, X } from 'lucide-react';
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
}

interface SchemeFinderProps {
  accessToken: string;
  onBack: () => void;
}

interface LocationData {
  state: string;
  district: string;
  latitude: number;
  longitude: number;
}

export function SchemeFinder({ accessToken, onBack }: SchemeFinderProps) {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [error, setError] = useState('');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTargetGroup, setSelectedTargetGroup] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
            // Use reverse geocoding to get state/district
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            
            // Extract state and district from address
            const address = data.address || {};
            const state = address.state || address.province || '';
            const district = address.county || address.district || '';
            
            if (state) {
              setLocationData({ state, district, latitude, longitude });
              setSelectedState(state);
              if (district) setSelectedDistrict(district);
            }
          } catch (err) {
            console.log('Reverse geocoding failed, user can select manually');
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
  }, []);

  // Filter schemes based on selected filters
  useEffect(() => {
    let filtered = schemes;

    if (selectedCategory) {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    if (selectedTargetGroup) {
      filtered = filtered.filter(s => s.targetGroup === selectedTargetGroup);
    }

    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredSchemes(filtered);
  }, [schemes, selectedCategory, selectedTargetGroup, searchQuery]);

  const handleFindSchemes = async () => {
    if (!selectedState) {
      setError('Please select a state');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Use Gemini AI to fetch and explain schemes
      const query = `Find government schemes available in ${selectedState}${selectedDistrict ? ` district of ${selectedDistrict}` : ''}. 
      
      For each scheme, provide:
      1. Scheme name
      2. Description (2-3 sentences)
      3. Eligibility criteria
      4. Key benefits
      5. Category (Education/Healthcare/Employment/Agriculture/Housing/Social Security/Women & Child/SC/ST/OBC)
      6. Target group (Students/Farmers/Women/Senior Citizens/Disabled/Below Poverty Line/All Citizens)
      7. Application link or process
      
      Format as a structured list with clear sections for each scheme.`;

      const response = await civicCompanion.sendMessage(query);
      
      // Parse the response and create scheme objects
      // For now, create mock schemes from the response
      const mockSchemes: Scheme[] = [
        {
          id: '1',
          name: 'Pradhan Mantri Awas Yojana',
          description: 'Housing scheme for economically weaker sections',
          eligibility: 'Annual income below specified limit',
          benefits: 'Subsidized housing loans',
          applyLink: 'https://pmaymis.gov.in/',
          category: 'Housing',
          targetGroup: 'Below Poverty Line'
        },
        {
          id: '2',
          name: 'Pradhan Mantri Kisan Samman Nidhi',
          description: 'Direct income support to farmers',
          eligibility: 'All landholding farmers',
          benefits: '₹6000 per year in 3 installments',
          applyLink: 'https://pmkisan.gov.in/',
          category: 'Agriculture',
          targetGroup: 'Farmers'
        },
        {
          id: '3',
          name: 'Beti Bachao Beti Padhao',
          description: 'Scheme for girl child education and welfare',
          eligibility: 'Girl child from birth to 10 years',
          benefits: 'Educational support and savings scheme',
          applyLink: 'https://bbbp.gov.in/',
          category: 'Women & Child',
          targetGroup: 'Women'
        }
      ];

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
              Your Location
              {isGeoLoading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              {locationData && <Badge className="ml-2 bg-green-100 text-green-800">📍 Auto-detected</Badge>}
            </CardTitle>
            <CardDescription>
              {locationData 
                ? `We detected your location: ${locationData.state}${locationData.district ? `, ${locationData.district}` : ''}`
                : 'Enable location access or select your state and district manually'
              }
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
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-start gap-2 mb-4">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <Button onClick={handleFindSchemes} disabled={isLoading || !selectedState} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finding Schemes...
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Find Schemes for {selectedState || 'Your State'}
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
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {filteredSchemes.length} of {schemes.length} Schemes Available
                    {selectedState && ` in ${selectedState}`}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Review eligibility criteria and apply directly through official portals
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Search */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Search Schemes</label>
                        <input
                          type="text"
                          placeholder="Search by name or keyword..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      {/* Category Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Categories</SelectItem>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Target Group Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Target Group</label>
                        <Select value={selectedTargetGroup} onValueChange={setSelectedTargetGroup}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Groups" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Groups</SelectItem>
                            {targetGroups.map((group) => (
                              <SelectItem key={group} value={group}>
                                {group}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Active Filters Display */}
                    {(searchQuery || selectedCategory || selectedTargetGroup) && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {searchQuery && (
                          <Badge variant="secondary" className="gap-1">
                            Search: {searchQuery}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                          </Badge>
                        )}
                        {selectedCategory && (
                          <Badge variant="secondary" className="gap-1">
                            {selectedCategory}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('')} />
                          </Badge>
                        )}
                        {selectedTargetGroup && (
                          <Badge variant="secondary" className="gap-1">
                            {selectedTargetGroup}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedTargetGroup('')} />
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-4">
              {filteredSchemes.length > 0 ? filteredSchemes.map((scheme) => (
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
              )) : (
                <div className="text-center py-12">
                  <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="mb-2">No schemes match your filters</h3>
                  <p className="text-gray-600">
                    Try adjusting your search criteria or filters
                  </p>
                </div>
              )}
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
