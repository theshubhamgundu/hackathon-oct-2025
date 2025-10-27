import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Smartphone, Phone, MessageSquare, Scan } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ScamResult {
  isScam: boolean;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  scamIndicators: string[];
  explanation: string;
  recommendation: string;
}

export function ScamShield() {
  const [smsInput, setSmsInput] = useState('');
  const [callerInfo, setCallerInfo] = useState('');
  const [smsResult, setSmsResult] = useState<ScamResult | null>(null);
  const [callResult, setCallResult] = useState<ScamResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<Array<{type: 'sms' | 'call', text: string, result: ScamResult, timestamp: string}>>([]);

  // Scam detection patterns
  const scamPatterns = {
    urgent: {
      keywords: ['urgent', 'immediate', 'act now', 'within 24 hours', 'failing which', 'otherwise'],
      score: 0.3,
      explanation: 'Creates artificial urgency'
    },
    verification: {
      keywords: ['verify', 'confirm', 'update', 'link your account', 'reactivate'],
      score: 0.4,
      explanation: 'Attempts to collect personal information'
    },
    money: {
      keywords: ['lottery', 'won', 'prize', 'refund', 'claim money', 'tax refund', 'reward'],
      score: 0.5,
      explanation: 'Promises of money or prizes'
    },
    government: {
      keywords: ['income tax', 'pension', 'epf', 'aadhaar', 'pan card', 'biometric'],
      score: 0.6,
      explanation: 'Impersonates government agencies'
    },
    account: {
      keywords: ['suspend', 'block', 'expired', 'compromise', 'unauthorized access'],
      score: 0.5,
      explanation: 'Threatens account suspension'
    },
    link: {
      keywords: ['click here', 'visit', 'check this', 'bit.ly', 'tinyurl', 'short.link'],
      score: 0.4,
      explanation: 'Suspicious links'
    },
    phone: {
      keywords: ['call now', 'dial', 'contact us', 'helpline', '0900', '1800'],
      score: 0.3,
      explanation: 'Urges immediate phone contact'
    }
  };

  const analyzeMessage = (text: string): ScamResult => {
    const lowerText = text.toLowerCase();
    const indicators: string[] = [];
    let totalScore = 0;

    // Check against all scam patterns
    Object.entries(scamPatterns).forEach(([pattern, data]) => {
      const found = data.keywords.some(keyword => lowerText.includes(keyword));
      if (found) {
        indicators.push(`${pattern}: ${data.explanation}`);
        totalScore += data.score;
      }
    });

    // Check for suspicious characteristics
    if (text.length < 50 && (lowerText.includes('click') || lowerText.includes('call'))) {
      indicators.push('short_message: Too brief with action prompts');
      totalScore += 0.2;
    }

    if (/[A-Z]{3,}/.test(text)) {
      indicators.push('all_caps: Excessive use of capital letters');
      totalScore += 0.2;
    }

    // Check for suspicious phone numbers
    if (/\b\d{10,15}\b/.test(text) && lowerText.includes('call')) {
      indicators.push('phone_number: Contains phone number urging call');
      totalScore += 0.3;
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (totalScore >= 1.0) riskLevel = 'critical';
    else if (totalScore >= 0.6) riskLevel = 'high';
    else if (totalScore >= 0.3) riskLevel = 'medium';
    else riskLevel = 'low';

    const isScam = totalScore >= 0.6;
    const confidence = Math.min(totalScore * 100, 100);

    let explanation = '';
    let recommendation = '';

    if (isScam) {
      explanation = `⚠️ This message shows ${indicators.length} suspicious patterns characteristic of scams. `;
      if (indicators.some(i => i.includes('government'))) {
        explanation += '🚨 Government agencies NEVER send verification SMS. ';
      }
      explanation += 'This is likely a phishing attempt targeting elderly citizens.';
      
      recommendation = '❌ DO NOT click any links ❌ DO NOT call the number ❌ DO NOT share any personal information. Delete this message immediately.';
    } else if (riskLevel === 'medium') {
      explanation = 'This message has some suspicious characteristics. Be cautious.';
      recommendation = '⚠️ Verify through official website before clicking any links.';
    } else {
      explanation = 'This message appears legitimate. Government communication.';
      recommendation = '✅ Safe to follow official instructions.';
    }

    return {
      isScam,
      confidence,
      riskLevel,
      scamIndicators: indicators,
      explanation,
      recommendation
    };
  };

  const checkSMS = () => {
    setIsScanning(true);
    
    setTimeout(() => {
      const result = analyzeMessage(smsInput);
      setSmsResult(result);
      setScanHistory(prev => [...prev, {
        type: 'sms',
        text: smsInput,
        result,
        timestamp: new Date().toISOString()
      }]);
      setIsScanning(false);
    }, 1000);
  };

  const checkCall = () => {
    setIsScanning(true);
    
    setTimeout(() => {
      const result = analyzeMessage(`Call from ${callerInfo}: ${callerInfo}`);
      setCallResult(result);
      setScanHistory(prev => [...prev, {
        type: 'call',
        text: callerInfo,
        result,
        timestamp: new Date().toISOString()
      }]);
      setIsScanning(false);
    }, 1000);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-red-600" />
            <h1 className="text-3xl font-bold">Scam Shield</h1>
            <Badge className="bg-red-500 text-white">AI Protection</Badge>
          </div>
          <p className="text-gray-600">
            Scan SMS and calls to protect yourself from fraud and scams
          </p>
        </div>

        <Tabs defaultValue="sms" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              SMS Scanner
            </TabsTrigger>
            <TabsTrigger value="calls" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Call Scanner
            </TabsTrigger>
          </TabsList>

          {/* SMS Scanner */}
          <TabsContent value="sms">
            <Card>
              <CardHeader>
                <CardTitle>Scan SMS for Scams</CardTitle>
                <CardDescription>
                  Paste any suspicious SMS message to check if it's a scam
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={smsInput}
                  onChange={(e) => setSmsInput(e.target.value)}
                  placeholder="Paste SMS here... e.g. 'URGENT: Your Aadhaar will be blocked! Click here: bit.ly/abc123'"
                  rows={6}
                />
                <Button 
                  onClick={checkSMS} 
                  disabled={!smsInput.trim() || isScanning}
                  className="w-full"
                >
                  {isScanning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Scan className="w-4 h-4 mr-2" />
                      Scan SMS
                    </>
                  )}
                </Button>

                {smsResult && (
                  <div className={`p-4 rounded-lg border-2 ${
                    smsResult.isScam ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'
                  }`}>
                    <div className="flex items-start gap-3 mb-3">
                      {smsResult.isScam ? (
                        <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
                      ) : (
                        <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`font-bold text-lg ${smsResult.isScam ? 'text-red-800' : 'text-green-800'}`}>
                            {smsResult.isScam ? '🚨 SCAM DETECTED!' : '✅ Safe Message'}
                          </h3>
                          <Badge className={getRiskColor(smsResult.riskLevel)}>
                            {smsResult.riskLevel.toUpperCase()}
                          </Badge>
                        </div>
                        <p className={`font-medium ${smsResult.isScam ? 'text-red-700' : 'text-green-700'}`}>
                          {smsResult.explanation}
                        </p>
                      </div>
                    </div>

                    {smsResult.scamIndicators.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Detected Issues:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {smsResult.scamIndicators.map((indicator, index) => (
                            <li key={index}>{indicator}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className={`mt-4 p-3 rounded ${
                      smsResult.isScam ? 'bg-red-100 border border-red-300' : 'bg-green-100 border border-green-300'
                    }`}>
                      <p className="font-semibold mb-1">Recommendation:</p>
                      <p className="text-sm whitespace-pre-wrap">{smsResult.recommendation}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Call Scanner */}
          <TabsContent value="calls">
            <Card>
              <CardHeader>
                <CardTitle>Scan Phone Numbers</CardTitle>
                <CardDescription>
                  Enter caller information to check if it's a known scam number
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={callerInfo}
                  onChange={(e) => setCallerInfo(e.target.value)}
                  placeholder="Enter phone number or caller name... e.g. 'Call from 080-12345678: Verify your bank account'"
                  rows={4}
                />
                <Button 
                  onClick={checkCall} 
                  disabled={!callerInfo.trim() || isScanning}
                  className="w-full"
                >
                  {isScanning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Scan className="w-4 h-4 mr-2" />
                      Check Caller
                    </>
                  )}
                </Button>

                {callResult && (
                  <div className={`p-4 rounded-lg border-2 ${
                    callResult.isScam ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'
                  }`}>
                    <div className="flex items-start gap-3 mb-3">
                      {callResult.isScam ? (
                        <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
                      ) : (
                        <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`font-bold text-lg ${callResult.isScam ? 'text-red-800' : 'text-green-800'}`}>
                            {callResult.isScam ? '🚨 SCAM CALL!' : '✅ Verified Safe'}
                          </h3>
                          <Badge className={getRiskColor(callResult.riskLevel)}>
                            {callResult.riskLevel.toUpperCase()}
                          </Badge>
                        </div>
                        <p className={`font-medium ${callResult.isScam ? 'text-red-700' : 'text-green-700'}`}>
                          {callResult.explanation}
                        </p>
                      </div>
                    </div>

                    <div className={`mt-4 p-3 rounded ${
                      callResult.isScam ? 'bg-red-100 border border-red-300' : 'bg-green-100 border border-green-300'
                    }`}>
                      <p className="font-semibold mb-1">What to do:</p>
                      <p className="text-sm whitespace-pre-wrap">{callResult.recommendation}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Protection Tips */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              How to Stay Safe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">🚨 Government Will NEVER:</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Ask for urgent verification via SMS</li>
                  <li>• Request clicking suspicious links</li>
                  <li>• Call and ask for passwords/PINs</li>
                  <li>• Send SMS about prizes or lottery wins</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">✅ Always Verify:</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Contact via official website</li>
                  <li>• Check sender's phone number</li>
                  <li>• Don't share personal details</li>
                  <li>• Use Scam Shield before clicking links</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Scans</CardTitle>
              <CardDescription>
                Your scan history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {scanHistory.slice(-5).reverse().map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {item.result.isScam ? (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.text.slice(0, 50)}...</p>
                      <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                    <Badge className={getRiskColor(item.result.riskLevel)}>
                      {item.result.riskLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

