import { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, Send, Loader2, CheckCircle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { API_BASE_URL } from '../utils/supabase-client';

interface Complaint {
  id: string;
  type: string;
  description: string;
  location: string | null;
  status: string;
  department: string;
  submittedAt: string;
}

interface ComplaintSupportProps {
  accessToken: string;
  onBack: () => void;
}

export function ComplaintSupport({ accessToken, onBack }: ComplaintSupportProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/complaints`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch complaints');
      }

      setComplaints(data.complaints);
    } catch (error: any) {
      console.error('Fetch complaints error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComplaint = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as string;
    const description = formData.get('description') as string;
    const location = formData.get('location') as string;

    try {
      const response = await fetch(`${API_BASE_URL}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ type, description, location })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit complaint');
      }

      setComplaints(prev => [data.complaint, ...prev]);
      setShowForm(false);
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error('Submit complaint error:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const complaintTypes = [
    'Streetlight not working',
    'Water leakage',
    'Drainage issue',
    'Garbage collection delay',
    'Road maintenance',
    'Power outage',
    'Other civic issue'
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return 'bg-blue-100 text-blue-700';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <h2>Complaint Support</h2>
              <p className="text-sm text-gray-600">File and track civic issues</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'View Complaints' : 'File New Complaint'}
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {showForm ? (
          <Card>
            <CardHeader>
              <CardTitle>File a New Complaint</CardTitle>
              <CardDescription>
                Report civic issues in your area and track their resolution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitComplaint} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="complaint-type">Issue Type *</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      {complaintTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complaint-location">Location</Label>
                  <Input
                    id="complaint-location"
                    name="location"
                    placeholder="e.g., Near City Hospital, Main Road"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complaint-description">Description *</Label>
                  <Textarea
                    id="complaint-description"
                    name="description"
                    placeholder="Provide detailed description of the issue..."
                    rows={5}
                    required
                  />
                </div>
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Complaint
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="mb-2">No complaints filed yet</h3>
                <p className="text-gray-600 mb-6">
                  Report civic issues in your area and track their resolution
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Send className="w-4 h-4 mr-2" />
                  File Your First Complaint
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="mb-1">Your Complaints ({complaints.length})</h3>
                  <p className="text-gray-600">
                    Track the status of your filed complaints
                  </p>
                </div>
                <div className="space-y-4">
                  {complaints.map((complaint) => (
                    <Card key={complaint.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              <AlertCircle className="w-5 h-5 text-orange-500" />
                              {complaint.type}
                            </CardTitle>
                            {complaint.location && (
                              <CardDescription className="mt-1">
                                📍 {complaint.location}
                              </CardDescription>
                            )}
                          </div>
                          <Badge className={getStatusColor(complaint.status)}>
                            {complaint.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm mb-1">Description:</h4>
                            <p className="text-sm text-gray-600">{complaint.description}</p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>Filed: {new Date(complaint.submittedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              <span>Department: {complaint.department}</span>
                            </div>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-md text-sm">
                            <p className="text-blue-700">
                              💡 <strong>Next Steps:</strong> Your complaint has been registered with {complaint.department}.
                              {complaint.status === 'Submitted' && ' You will be notified once action is taken.'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Info Section */}
        {!showForm && (
          <div className="mt-12 bg-orange-50 rounded-lg p-6">
            <h3 className="mb-2">How Complaint Support Works</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-1">1.</span>
                <span><strong>File Complaint:</strong> Select the issue type and provide detailed description with location</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-1">2.</span>
                <span><strong>Auto-Routing:</strong> JanAI automatically determines the responsible department</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-1">3.</span>
                <span><strong>Track Status:</strong> Monitor your complaint status: Submitted → In Progress → Resolved</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-1">4.</span>
                <span><strong>Follow Up:</strong> Contact the assigned department if no action is taken within reasonable time</span>
              </li>
            </ul>
            <p className="text-sm text-gray-600 mt-4">
              <strong>Common Departments:</strong> Municipal Electrical (streetlights), Water Supply (leakage), 
              PWD (roads/drainage), Solid Waste Management (garbage), Electricity Board (power)
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
