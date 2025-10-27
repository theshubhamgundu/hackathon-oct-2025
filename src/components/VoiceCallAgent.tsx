import { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, Globe, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { API_BASE_URL } from '../utils/supabase-client';

interface VoiceCall {
  id: string;
  department: string;
  purpose: string;
  language: string;
  status: 'initiated' | 'calling' | 'on_call' | 'completed' | 'failed';
  agentTranscript?: string;
  resolution?: string;
  startedAt?: string;
  completedAt?: string;
}

export function VoiceCallAgent() {
  const [activeCall, setActiveCall] = useState<VoiceCall | null>(null);
  const [callHistory, setCallHistory] = useState<VoiceCall[]>([]);
  const [isCalling, setIsCalling] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [callPurpose, setCallPurpose] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const [agentTranscript, setAgentTranscript] = useState<string[]>([]);

  const departments = [
    { name: 'Pension Department', phone: '+911234567890' },
    { name: 'Ration Card Office', phone: '+911234567891' },
    { name: 'Aadhaar Support', phone: '18003001947' },
    { name: 'Income Tax Office', phone: '18001030015' },
    { name: 'Municipal Corporation', phone: '+911234567892' },
    { name: 'Electricity Board', phone: '1912' },
    { name: 'Water Supply', phone: '15513' },
  ];

  const languages = [
    { code: 'en-IN', name: 'English', flag: '🇬🇧' },
    { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
    { code: 'ta-IN', name: 'Tamil', flag: '🇮🇳' },
    { code: 'te-IN', name: 'Telugu', flag: '🇮🇳' },
    { code: 'bn-IN', name: 'Bengali', flag: '🇮🇳' },
    { code: 'mr-IN', name: 'Marathi', flag: '🇮🇳' },
  ];

  const initiateCall = async () => {
    if (!selectedDepartment || !callPurpose) {
      alert('Please select department and describe your purpose');
      return;
    }

    setIsCalling(true);
    
    // Simulate AI agent making the call
    const newCall: VoiceCall = {
      id: Date.now().toString(),
      department: selectedDepartment,
      purpose: callPurpose,
      language: selectedLanguage,
      status: 'initiated',
      startedAt: new Date().toISOString()
    };

    setActiveCall(newCall);
    setAgentTranscript([]);

    // Simulate call progress
    setTimeout(() => {
      setActiveCall(prev => prev ? { ...prev, status: 'calling' } : null);
      setAgentTranscript(prev => [...prev, '🤖 AI Agent: Initiating call...']);
    }, 2000);

    setTimeout(() => {
      setActiveCall(prev => prev ? { ...prev, status: 'on_call' } : null);
      setAgentTranscript(prev => [...prev, '📞 Connected to department representative', '🤖 AI Agent: This is an automated call from JanAI Civic Assistant', '🤖 AI Agent: Purpose: ' + callPurpose]);
    }, 4000);

    setTimeout(() => {
      setAgentTranscript(prev => [
        ...prev,
        '📞 Department: Thank you for calling, how can I help you?',
        '🤖 AI Agent: I\'m calling on behalf of our user for: ' + callPurpose,
        '🤖 AI Agent: Can you please check the status/help with this matter?',
        '📞 Department: Let me check our records...',
        '📞 Department: Your case is under review, will be processed in 5-7 days',
        '🤖 AI Agent: Thank you! I\'ll inform the user.',
      ]);
    }, 8000);

    setTimeout(() => {
      setActiveCall(prev => prev ? { ...prev, status: 'completed', completedAt: new Date().toISOString(), resolution: 'Status confirmed. Expected resolution: 5-7 days' } : null);
      setIsCalling(false);
      setCallHistory(prev => [newCall, ...prev]);
      setAgentTranscript(prev => [...prev, '✅ Call completed successfully', '📝 Resolution: ' + callPurpose + ' - Status confirmed, will be processed in 5-7 days']);
    }, 12000);
  };

  const endCall = () => {
    if (activeCall) {
      const completedCall = { ...activeCall, status: 'completed' as const };
      setCallHistory(prev => [completedCall, ...prev]);
      setActiveCall(null);
      setAgentTranscript([]);
    }
    setIsCalling(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            Voice Call Agent
            <Badge className="bg-purple-500">AI Agent Delegation</Badge>
          </h1>
          <p className="text-gray-600">
            Let AI call government departments on your behalf. Multilingual support. Automatic follow-up until resolved.
          </p>
        </div>

        {/* Active Call Display */}
        {activeCall && (
          <Card className="mb-6 border-2 border-purple-500 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-6 h-6 text-purple-600" />
                Active Call - {activeCall.department}
                {activeCall.status === 'on_call' && <Badge className="bg-green-500 animate-pulse">On Call</Badge>}
              </CardTitle>
              <CardDescription>
                Agent is communicating on your behalf in {languages.find(l => l.code === activeCall.language)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg max-h-64 overflow-y-auto">
                  <h4 className="font-semibold mb-2">Live Transcript:</h4>
                  <div className="space-y-2">
                    {agentTranscript.map((line, index) => (
                      <p key={index} className="text-sm text-gray-700">{line}</p>
                    ))}
                    {activeCall.status === 'on_call' && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Agent is speaking...</span>
                      </div>
                    )}
                  </div>
                </div>
                {activeCall.status === 'completed' && (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="font-semibold text-green-800">✅ Resolution:</p>
                    <p className="text-sm text-green-700">{activeCall.resolution}</p>
                  </div>
                )}
                <Button onClick={endCall} variant="destructive" className="w-full">
                  <PhoneOff className="w-4 h-4 mr-2" />
                  End Call
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call Configuration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Initiate a Call</CardTitle>
            <CardDescription>
              Select department and describe what you need. AI will call and handle everything.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Department to Call</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a government department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.name} value={dept.name}>
                      {dept.name} - {dept.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">What Do You Need?</label>
              <Textarea
                value={callPurpose}
                onChange={(e) => setCallPurpose(e.target.value)}
                placeholder="e.g., Check my pension status, File a complaint about water supply, Apply for ration card"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Language for AI Agent
              </label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={initiateCall} 
              disabled={!selectedDepartment || !callPurpose || isCalling}
              className="w-full"
              size="lg"
            >
              {isCalling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI Agent is Calling...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Let AI Make the Call
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle>How AI Agent Delegation Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold">1. You Request</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Tell AI what you need from which department
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold">2. AI Calls</h4>
                </div>
                <p className="text-sm text-gray-600">
                  AI agent calls in your language and handles the conversation
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold">3. Auto-Followup</h4>
                </div>
                <p className="text-sm text-gray-600">
                  AI keeps calling until your issue is resolved
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call History */}
        {callHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Call History</CardTitle>
              <CardDescription>
                Past calls made by AI agent on your behalf
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {callHistory.slice(0, 5).map((call) => (
                  <div key={call.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Phone className="w-4 h-4 text-gray-600" />
                          <span className="font-semibold">{call.department}</span>
                          <Badge className="bg-green-500 text-white text-xs">{call.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{call.purpose}</p>
                        {call.resolution && (
                          <p className="text-sm text-green-700 mt-2">
                            ✅ {call.resolution}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 text-right">
                        {call.completedAt && new Date(call.completedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Integration Info */}
        <Card className="mt-6 bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle>🔌 Twilio Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">
              This feature requires Twilio API integration. The AI agent uses:
            </p>
            <ul className="text-sm text-gray-700 mt-2 space-y-1">
              <li>• Voice AI to communicate in multiple languages</li>
              <li>• Automatic dialing and conversation handling</li>
              <li>• Transcript logging for your records</li>
              <li>• Follow-up automation until resolution</li>
            </ul>
            <p className="text-xs text-gray-600 mt-3">
              Note: Currently in simulation mode. Enable Twilio API key in backend for production use.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

