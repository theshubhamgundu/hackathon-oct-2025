import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Languages, X, Minimize2, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { civicCompanion } from '../utils/geminiService';

interface VoiceAssistantProps {
  onVoiceCommand?: (command: string, language: string) => void;
  currentScreen?: string;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  speechCode: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', speechCode: 'en-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechCode: 'bn-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', speechCode: 'gu-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', speechCode: 'ml-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechCode: 'pa-IN' },
];

export function VoiceAssistant({ onVoiceCommand, currentScreen }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [lastCommand, setLastCommand] = useState('');

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    // Initialize speech recognition
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = selectedLanguage.speechCode;

    recognitionRef.current.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      
      setTranscript(transcript);

      // Process final result
      if (event.results[0].isFinal) {
        handleVoiceCommand(transcript);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    // Initialize speech synthesis
    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [selectedLanguage]);

  const handleVoiceCommand = async (command: string) => {
    setLastCommand(command);
    
    // Process command based on keywords
    const lowerCommand = command.toLowerCase();
    let response = '';
    let commandType = '';
    let isNavigation = false;

    // Navigation commands
    if (lowerCommand.includes('dashboard') || lowerCommand.includes('home') || lowerCommand.includes('डैशबोर्ड')) {
      response = getTranslatedResponse('Opening dashboard', selectedLanguage.code);
      commandType = 'navigate:dashboard';
      isNavigation = true;
      onVoiceCommand?.(commandType, selectedLanguage.code);
    } else if (lowerCommand.includes('document') || lowerCommand.includes('दस्तावेज़')) {
      response = getTranslatedResponse('Opening document wallet', selectedLanguage.code);
      commandType = 'navigate:documents';
      isNavigation = true;
      onVoiceCommand?.(commandType, selectedLanguage.code);
    } else if (lowerCommand.includes('scheme') || lowerCommand.includes('योजना')) {
      response = getTranslatedResponse('Opening scheme finder', selectedLanguage.code);
      commandType = 'navigate:schemes';
      isNavigation = true;
      onVoiceCommand?.(commandType, selectedLanguage.code);
    } else if (lowerCommand.includes('complaint') || lowerCommand.includes('शिकायत')) {
      response = getTranslatedResponse('Opening complaint support', selectedLanguage.code);
      commandType = 'navigate:complaints';
      isNavigation = true;
      onVoiceCommand?.(commandType, selectedLanguage.code);
    } else if (lowerCommand.includes('profile') || lowerCommand.includes('प्रोफ़ाइल')) {
      response = getTranslatedResponse('Opening profile', selectedLanguage.code);
      commandType = 'navigate:profile';
      isNavigation = true;
      onVoiceCommand?.(commandType, selectedLanguage.code);
    } else if (lowerCommand.includes('chat') || lowerCommand.includes('companion') || lowerCommand.includes('साथी')) {
      response = getTranslatedResponse('Opening civic companion', selectedLanguage.code);
      commandType = 'navigate:companion';
      isNavigation = true;
      onVoiceCommand?.(commandType, selectedLanguage.code);
    } else {
      // General query - use Gemini AI for intelligent response (AGENTIC MODE)
      try {
        setIsListening(false); // Stop listening while processing
        response = await civicCompanion.sendMessage(command);
        if (!response || response.trim().length === 0) {
          response = 'I am processing your request. Please ask again.';
        }
      } catch (error: any) {
        console.error('Voice AI error:', error);
        response = `I encountered an error: ${error.message}. Please try again.`;
      }
      commandType = `query:${command}`;
      onVoiceCommand?.(commandType, selectedLanguage.code);
    }

    // Speak response in selected language
    speak(response);
    
    // For non-navigation queries, continue listening for follow-up
    if (!isNavigation) {
      setTimeout(() => {
        setTranscript('');
        recognitionRef.current?.start();
        setIsListening(true);
      }, response.length * 50 + 1000); // Wait for speech to finish
    }
  };

  const getTranslatedResponse = (text: string, langCode: string): string => {
    const translations: Record<string, Record<string, string>> = {
      'en': {
        'Opening dashboard': 'Opening dashboard',
        'Opening document wallet': 'Opening document wallet',
        'Opening scheme finder': 'Opening scheme finder',
        'Opening complaint support': 'Opening complaint support',
        'Opening profile': 'Opening profile',
        'Opening civic companion': 'Opening civic companion',
        'Let me help you with that': 'Let me help you with that',
        'Language changed to': 'Language changed to'
      },
      'hi': {
        'Opening dashboard': 'डैशबोर्ड खोल रहे हैं',
        'Opening document wallet': 'दस्तावेज़ वॉलेट खोल रहे हैं',
        'Opening scheme finder': 'योजना खोजक खोल रहे हैं',
        'Opening complaint support': 'शिकायत सहायता खोल रहे हैं',
        'Opening profile': 'प्रोफ़ाइल खोल रहे हैं',
        'Opening civic companion': 'नागरिक साथी खोल रहे हैं',
        'Let me help you with that': 'मुझे आपकी मदद करने दीजिए',
        'Language changed to': 'भाषा बदल गई है'
      },
      'ta': {
        'Opening dashboard': 'டாஷ்போர்டை திறக்கிறேன்',
        'Opening document wallet': 'ஆவண பணப்பையை திறக்கிறேன்',
        'Opening scheme finder': 'திட்ட கண்டுபிடிப்பாளரை திறக்கிறேன்',
        'Opening complaint support': 'புகார் ஆதரவை திறக்கிறேன்',
        'Opening profile': 'சுயவிவரத்தை திறக்கிறேன்',
        'Opening civic companion': 'குடிமை துணையை திறக்கிறேன்',
        'Let me help you with that': 'உங்களுக்கு உதவ அனுமதிக்கவும்',
        'Language changed to': 'மொழி மாற்றப்பட்டது'
      },
      'te': {
        'Opening dashboard': 'డ్యాష్‌బోర్డ్‌ను తెరుస్తున్నాను',
        'Opening document wallet': 'డాక్యుమెంట్ వాలెట్‌ను తెరుస్తున్నాను',
        'Opening scheme finder': 'స్కీమ్ ఫైండర్‌ను తెరుస్తున్నాను',
        'Opening complaint support': 'ఫిర్యాదు సపోర్టు‌ను తెరుస్తున్నాను',
        'Opening profile': 'ప్రొఫైల్‌ను తెరుస్తున్నాను',
        'Opening civic companion': 'సివిక్ కంపానియన్‌ను తెరుస్తున్నాను',
        'Let me help you with that': 'దానికి సహాయం చేయనివ్వండి',
        'Language changed to': 'భాష మార్చబడింది'
      },
      'bn': {
        'Opening dashboard': 'ড্যাশবোর্ড খুলছি',
        'Opening document wallet': 'ডকুমেন্ট ওয়ালেট খুলছি',
        'Opening scheme finder': 'স্কিম ফাইন্ডার খুলছি',
        'Opening complaint support': 'অভিযোগ সহায়তা খুলছি',
        'Opening profile': 'প্রোফাইল খুলছি',
        'Opening civic companion': 'নাগরিক সঙ্গী খুলছি',
        'Let me help you with that': 'আপনাকে সাহায্য করতে দিন',
        'Language changed to': 'ভাষা পরিবর্তন করা হয়েছে'
      },
      'mr': {
        'Opening dashboard': 'डॅशबोर्ड उघडत आहे',
        'Opening document wallet': 'दस्तऐवज वॉलेट उघडत आहे',
        'Opening scheme finder': 'योजना शोधक उघडत आहे',
        'Opening complaint support': 'तक्रार समर्थन उघडत आहे',
        'Opening profile': 'प्रोफाइल उघडत आहे',
        'Opening civic companion': 'नागरिक साथी उघडत आहे',
        'Let me help you with that': 'मला तुम्हाला मदत करू द्या',
        'Language changed to': 'भाषा बदलली गेली'
      },
      'gu': {
        'Opening dashboard': 'ડેશબોર્ડ ખોલી રહ્યો છું',
        'Opening document wallet': 'ડોક્યુમેન્ટ વૉલેટ ખોલી રહ્યો છું',
        'Opening scheme finder': 'સ્કીમ ફાઇન્ડર ખોલી રહ્યો છું',
        'Opening complaint support': 'ફરિયાદ સપોર્ટ ખોલી રહ્યો છું',
        'Opening profile': 'પ્રોફાઇલ ખોલી રહ્યો છું',
        'Opening civic companion': 'નાગરિક સાથી ખોલી રહ્યો છું',
        'Let me help you with that': 'મને તમને મદદ કરવા દો',
        'Language changed to': 'ભાષા બદલાઈ ગઈ'
      },
      'kn': {
        'Opening dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯುತ್ತಿದ್ದೇನೆ',
        'Opening document wallet': 'ಡಾಕ್ಯುಮೆಂಟ್ ವಾಲೆಟ್ ತೆರೆಯುತ್ತಿದ್ದೇನೆ',
        'Opening scheme finder': 'ಸ್ಕೀಮ್ ಫೈಂಡರ್ ತೆರೆಯುತ್ತಿದ್ದೇನೆ',
        'Opening complaint support': 'ಮನವಿ ಸಹಾಯ ತೆರೆಯುತ್ತಿದ್ದೇನೆ',
        'Opening profile': 'ಪ್ರೊಫೈಲ್ ತೆರೆಯುತ್ತಿದ್ದೇನೆ',
        'Opening civic companion': 'ನಾಗರಿಕ ಸಂಗಾತಿ ತೆರೆಯುತ್ತಿದ್ದೇನೆ',
        'Let me help you with that': 'ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ನನ್ನನ್ನು ಅನುಮತಿಸಿ',
        'Language changed to': 'ಭಾಷೆ ಬದಲಾಯಿಸಲಾಗಿದೆ'
      },
      'ml': {
        'Opening dashboard': 'ഡാഷ്‌ബോർഡ് തുറക്കുകയാണ്',
        'Opening document wallet': 'ഡോക്യുമെന്റ് വാലറ്റ് തുറക്കുകയാണ്',
        'Opening scheme finder': 'സ്കീം ഫൈൻഡർ തുറക്കുകയാണ്',
        'Opening complaint support': 'പരാതി പിന്തുണ തുറക്കുകയാണ്',
        'Opening profile': 'പ്രൊഫൈൽ തുറക്കുകയാണ്',
        'Opening civic companion': 'സിവിക് സങ്ങി തുറക്കുകയാണ്',
        'Let me help you with that': 'നിങ്ങളെ സഹായിക്കാൻ എന്നെ അനുവദിക്കുക',
        'Language changed to': 'ഭാഷ മാറ്റിയിരിക്കുന്നു'
      },
      'pa': {
        'Opening dashboard': 'ਡੈਸ਼ਬੋਰਡ ਖੋਲ ਰਿਹਾ ਹਾਂ',
        'Opening document wallet': 'ਡੌਕੂਮੈਂਟ ਵਾਲਿਟ ਖੋਲ ਰਿਹਾ ਹਾਂ',
        'Opening scheme finder': 'ਸਕੀਮ ਫਾਈਂਡਰ ਖੋਲ ਰਿਹਾ ਹਾਂ',
        'Opening complaint support': 'ਸ਼ਿਕਾਇਤ ਸਹਾਇਤਾ ਖੋਲ ਰਿਹਾ ਹਾਂ',
        'Opening profile': 'ਪ੍ਰੋਫਾਈਲ ਖੋਲ ਰਿਹਾ ਹਾਂ',
        'Opening civic companion': 'ਸਿਵਿਕ ਸਾਥੀ ਖੋਲ ਰਿਹਾ ਹਾਂ',
        'Let me help you with that': 'ਮੈਨੂੰ ਤੁਹਾਨੂੰ ਮਦਦ ਕਰਨ ਦਿਓ',
        'Language changed to': 'ਭਾਸ਼ਾ ਬਦਲ ਦਿੱਤੀ ਗਈ'
      }
    };

    return translations[langCode]?.[text] || text;
  };

  const speak = async (text: string) => {
    try {
      if (!synthRef.current) {
        console.error('Speech synthesis not supported or initialized');
        return;
      }

      console.log('Speaking text:', text, 'in language:', selectedLanguage.speechCode);
      
      // Cancel any ongoing speech
      synthRef.current.cancel();

      // Ensure voices are loaded
      let voices = synthRef.current.getVoices();
      console.log('Available voices:', voices);
      
      if (voices.length === 0) {
        console.log('No voices found, waiting for voices to load...');
        // If voices aren't loaded yet, wait for them to load
        await new Promise<void>((resolve) => {
          const onVoicesChanged = () => {
            const newVoices = synthRef.current?.getVoices() || [];
            console.log('Voices changed, found:', newVoices.length, 'voices');
            if (newVoices.length > 0) {
              synthRef.current?.removeEventListener('voiceschanged', onVoicesChanged);
              voices = newVoices;
              resolve();
            }
          };
          
          synthRef.current?.addEventListener('voiceschanged', onVoicesChanged);
          
          // Some browsers don't fire the voiceschanged event, so set a timeout
          setTimeout(() => {
            const timeoutVoices = synthRef.current?.getVoices() || [];
            console.log('Voices loaded after timeout:', timeoutVoices.length);
            if (timeoutVoices.length > 0) {
              voices = timeoutVoices;
            }
            synthRef.current?.removeEventListener('voiceschanged', onVoicesChanged);
            resolve();
          }, 2000);
        });
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage.speechCode;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Log available voices for debugging
      console.log('All available voices:', voices);
      console.log('Looking for voice matching language code:', selectedLanguage.code, 'or speech code:', selectedLanguage.speechCode);

      // Try to find a voice that matches the selected language
      const languageCode = selectedLanguage.code.toLowerCase();
      const speechCode = selectedLanguage.speechCode.toLowerCase();
      
      // First try exact match with speech code (e.g., 'te-IN')
      let preferredVoice = voices.find(voice => {
        const voiceLang = voice.lang.toLowerCase();
        console.log('Checking voice:', voice.name, 'with lang:', voiceLang);
        return voiceLang === speechCode;
      });

      // If not found, try matching just the language code (e.g., 'te')
      if (!preferredVoice) {
        console.log('No exact match, trying language code match...');
        preferredVoice = voices.find(voice => {
          const voiceLang = voice.lang.toLowerCase();
          return voiceLang.startsWith(languageCode + '-') || voiceLang === languageCode;
        });
      }

      // If still not found, try any voice that includes the language code
      if (!preferredVoice) {
        console.log('No language code match, trying partial match...');
        preferredVoice = voices.find(voice => 
          voice.lang.toLowerCase().includes(languageCode)
        );
      }

      // If we found a matching voice, use it
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log('Using voice:', preferredVoice.name, 'for language:', selectedLanguage.name, 
                   'voice lang:', preferredVoice.lang);
      } else {
        console.warn('No matching voice found for language:', selectedLanguage.name, 
                    'Using default voice for:', utterance.lang);
        // Try to use the first available voice if none matched
        if (voices.length > 0) {
          utterance.voice = voices[0];
          console.log('Falling back to first available voice:', voices[0].name);
        }
      }

      utterance.onend = () => {
        console.log('Speech synthesis ended');
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
      };

      utterance.onboundary = (event) => {
        console.log('Speech boundary:', event);
      };

      console.log('Starting speech with utterance:', {
        text,
        lang: utterance.lang,
        voice: utterance.voice?.name || 'default',
        rate: utterance.rate,
        pitch: utterance.pitch
      });

      setIsSpeaking(true);
      synthRef.current.speak(utterance);
    } catch (error) {
      console.error('Error in speak function:', error);
      setIsSpeaking(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleLanguageChange = (langCode: string) => {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === langCode) || SUPPORTED_LANGUAGES[0];
    setSelectedLanguage(language);
    
    if (recognitionRef.current) {
      recognitionRef.current.lang = language.speechCode;
    }
    
    // Announce language change in the new language
    const changeMessage = getTranslatedResponse('Language changed to', language.code);
    speak(`${changeMessage} ${language.nativeName}`);
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      synthRef.current?.cancel();
      setIsSpeaking(false);
    } else if (lastCommand) {
      speak(lastCommand);
    }
  };

  // Render the appropriate UI based on state
  if (!isSupported) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-sm text-red-600">
            Voice features not supported in this browser. Please use Chrome or Edge.
          </p>
        </Card>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
        >
          <Mic className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="p-4 bg-white shadow-2xl border-2 border-orange-200 w-80">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${isListening ? 'bg-red-100' : 'bg-orange-100'}`}>
              {isListening ? (
                <Mic className="w-4 h-4 text-red-600 animate-pulse" />
              ) : (
                <Mic className="w-4 h-4 text-orange-600" />
              )}
            </div>
            <div>
              <h3 className="text-sm">Voice Assistant</h3>
              {isListening && (
                <Badge variant="destructive" className="text-xs">Listening...</Badge>
              )}
              {isSpeaking && (
                <Badge className="text-xs bg-blue-500">Speaking...</Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Language Selector */}
        <div className="mb-4">
          <Select value={selectedLanguage.code} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">{transcript}</p>
          </div>
        )}

        {/* Last Command */}
        {lastCommand && !isListening && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-600 mb-1">Last Command:</p>
            <p className="text-sm text-gray-700">{lastCommand}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            onClick={toggleListening}
            className={`flex-1 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'}`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Speak
              </>
            )}
          </Button>
          <Button
            onClick={toggleSpeech}
            variant="outline"
            disabled={!lastCommand}
          >
            {isSpeaking ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            <strong>Try saying:</strong><br />
            • "Open dashboard"<br />
            • "Show my documents"<br />
            • "Find schemes"<br />
            • "File a complaint"<br />
            • Or ask any question!
          </p>
        </div>
      </Card>
    </div>
  );
}
