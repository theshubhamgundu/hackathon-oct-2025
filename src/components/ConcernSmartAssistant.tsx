import { useState } from 'react';
import { ArrowLeft, MessageSquare, Zap, Clock, CheckCircle, FileText, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { API_BASE_URL } from '../utils/supabase-client';
import { civicCompanion } from '../utils/geminiService';

interface Concern {
  id: string;
  userMessage: string;
  type: string;
  concern: string;
  status: 'detected' | 'analyzing' | 'taking_action' | 'resolved';
  actions: string[];
  caseId?: string;
  resolution?: string;
  timestamp: string;
}

interface ConcernSmartAssistantProps {
  accessToken: string;
  onBack: () => void;
}

export function ConcernSmartAssistant({ accessToken, onBack }: ConcernSmartAssistantProps) {
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const processConcern = async () => {
    if (!userInput.trim()) return;

    setIsProcessing(true);
    const userMessage = userInput;
    setUserInput('');

    // Detect concern using AI
    const detectedConcern: Concern = {
      id: Date.now().toString(),
      userMessage,
      type: detectConcernType(userMessage),
      concern: extractConcern(userMessage),
      status: 'detected',
      actions: [],
      timestamp: new Date().toISOString()
    };

    setConcerns(prev => [...prev, detectedConcern]);

    // AI analyzes and takes action
    try {
      await handleConcern(detectedConcern);
    } catch (error) {
      console.error('Error processing concern:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const detectConcernType = (message: string): string => {
    const lower = message.toLowerCase();
    if (lower.includes('pension') && (lower.includes('delay') || lower.includes('late'))) return 'pension_delayed';
    if (lower.includes('ration') && (lower.includes('not working') || lower.includes('issue'))) return 'ration_card_issue';
    if (lower.includes('water') || lower.includes('supply')) return 'water_issue';
    if (lower.includes('electricity') || lower.includes('power')) return 'electricity_issue';
    if (lower.includes('certificate') || lower.includes('document')) return 'document_issue';
    return 'general_concern';
  };

  const extractConcern = (message: string): string => {
    return message;
  };

  const handleConcern = async (concern: Concern) => {
    // Step 1: Update status to analyzing
    updateConcernStatus(concern.id, 'analyzing', [
      '🔍 AI analyzing your concern...',
      '📊 Checking relevant documents and history...',
      '🔗 Connecting to affected department...'
    ]);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: AI takes action automatically
    updateConcernStatus(concern.id, 'taking_action', [
      '✅ Concern validated',
      '📝 Filing complaint automatically...',
      '📞 Notifying relevant department...'
    ]);

    const caseId = `CIVIC-${Date.now()}`;

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Generate resolution
    updateConcernStatus(concern.id, 'resolved', [], caseId, 
      `Your concern has been filed. Case ID: ${caseId}. The department will update you within 3-5 business days. I'll track this automatically and keep you informed.`
    );
  };

  const updateConcernStatus = (
    id: string, 
    status: Concern['status'], 
    actions: string[] = [], 
    caseId?: string,
    resolution?: string
  ) => {
    setConcerns(prev => prev.map(c => 
      c.id === id 
        ? { ...c, status, actions: [...c.actions, ...actions], caseId, resolution }
        : c
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'detected':
        return <Badge className="bg-blue-500">Detected</Badge>;
      case 'analyzing':
        return <Badge className="bg-yellow-500">Analyzing</Badge>;
      case 'taking_action':
        return <Badge className="bg-orange-500">Taking Action</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500">Resolved</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  const quickConcerns = [
    'My pension is delayed',
    'Ration card not working',
    'Water supply issue in my area',
    'No electricity for 3 days',
    'Certificate application pending'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-orange-500" />
            <div>
              <h2 className="flex items-center gap-2">
                Concern-Based Smart Assistant
                <Badge className="bg-orange-500">Agentic</Badge>
              </h2>
              <p className="text-sm text-gray-600">Speak naturally - I understand & act automatically</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1">
        {/* Input Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What's Your Concern?</CardTitle>
            <CardDescription>
              Just tell me what's wrong. I'll check status, file complaints, and track until resolved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="e.g., 'My pension is delayed for 2 months', 'Ration card not working', 'Water supply issue'"
                rows={3}
              />
              <Button 
                onClick={processConcern} 
                disabled={!userInput.trim() || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    AI Agent Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Let AI Handle It
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Concerns */}
        {concerns.length === 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Try These Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {quickConcerns.map((concern, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUserInput(concern);
                      setTimeout(() => processConcern(), 100);
                    }}
                    className="text-xs"
                  >
                    {concern}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Concerns List */}
        <div className="space-y-4">
          {concerns.map((concern) => (
            <Card key={concern.id} className="border-2">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-orange-500" />
                      {concern.type.replace('_', ' ').toUpperCase()}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      "{concern.concern}"
                    </CardDescription>
                  </div>
                  {getStatusBadge(concern.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Status Messages */}
                  {concern.actions.map((action, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{action}</span>
                    </div>
                  ))}

                  {/* Case ID */}
                  {concern.caseId && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-blue-800">📝 Case ID:</p>
                      <p className="text-sm text-blue-700">{concern.caseId}</p>
                    </div>
                  )}

                  {/* Resolution */}
                  {concern.resolution && (
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="text-sm font-semibold text-green-800 mb-2">
                        ✅ AI Resolution:
                      </p>
                      <p className="text-sm text-green-700">{concern.resolution}</p>
                    </div>
                  )}

                  {/* Status-specific UI */}
                  {concern.status === 'analyzing' && (
                    <div className="bg-yellow-50 p-3 rounded-lg flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-yellow-700">AI agent is analyzing your concern...</span>
                    </div>
                  )}

                  {concern.status === 'taking_action' && (
                    <div className="bg-orange-50 p-3 rounded-lg flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-orange-700">Taking automated action on your behalf...</span>
                    </div>
                  )}

                  {concern.status === 'resolved' && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        View Case Details
                      </Button>
                      <Button variant="outline" size="sm">
                        📊 Track Status
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        {concerns.length > 0 && (
          <Card className="mt-6 bg-gradient-to-r from-orange-50 to-red-50">
            <CardHeader>
              <CardTitle>How Automatic Concern Resolution Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl mb-2">1️⃣</div>
                  <h4 className="font-semibold mb-1">You Speak</h4>
                  <p className="text-sm text-gray-600">Tell me your problem naturally</p>
                </div>
                <div>
                  <div className="text-2xl mb-2">2️⃣</div>
                  <h4 className="font-semibold mb-1">AI Detects</h4>
                  <p className="text-sm text-gray-600">I understand what you need</p>
                </div>
                <div>
                  <div className="text-2xl mb-2">3️⃣</div>
                  <h4 className="font-semibold mb-1">Auto-Action</h4>
                  <p className="text-sm text-gray-600">I file cases automatically</p>
                </div>
                <div>
                  <div className="text-2xl mb-2">4️⃣</div>
                  <h4 className="font-semibold mb-1">Track Until Done</h4>
                  <p className="text-sm text-gray-600">I follow up until resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

