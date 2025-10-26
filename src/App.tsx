import { useState, useEffect } from 'react';
import { supabase } from './utils/supabase-client';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { CivicCompanion } from './components/CivicCompanion';
import { DocumentWalletEnhanced } from './components/DocumentWalletEnhanced';
import { SchemeFinder } from './components/SchemeFinder';
import { ComplaintSupport } from './components/ComplaintSupport';
import { UserProfile } from './components/UserProfile';
import { VoiceAssistant } from './components/VoiceAssistant';
import { FeatureHighlight } from './components/FeatureHighlight';
import { LanguageProvider } from './utils/language-context';

type Screen = 'dashboard' | 'companion' | 'documents' | 'schemes' | 'complaints' | 'profile';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [accessToken, setAccessToken] = useState('');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [voiceQuery, setVoiceQuery] = useState('');
  const [showFeatureHighlight, setShowFeatureHighlight] = useState(false);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        setAccessToken(session.access_token);
        setUserId(session.user.id);
        setUserName(session.user.user_metadata?.name || 'User');
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleAuthSuccess = (token: string, id: string) => {
    setAccessToken(token);
    setUserId(id);
    setIsAuthenticated(true);
    
    // Show feature highlight for new users
    setShowFeatureHighlight(true);
    
    // Fetch user name
    supabase.auth.getUser(token).then(({ data }) => {
      if (data?.user?.user_metadata?.name) {
        setUserName(data.user.user_metadata.name);
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setAccessToken('');
    setUserId('');
    setUserName('');
    setCurrentScreen('dashboard');
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as Screen);
  };

  const handleBack = () => {
    setCurrentScreen('dashboard');
  };

  const handleVoiceCommand = (command: string, language: string) => {
    console.log('Voice command:', command, 'Language:', language);
    
    // Handle navigation commands
    if (command.startsWith('navigate:')) {
      const screen = command.split(':')[1];
      setCurrentScreen(screen as Screen);
    } else if (command.startsWith('query:')) {
      // Extract query and navigate to companion
      const query = command.split(':')[1];
      setVoiceQuery(query);
      setCurrentScreen('companion');
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-green-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading JanAI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <LanguageProvider>
      <div className="relative">
        {/* Feature Highlight */}
        {showFeatureHighlight && <FeatureHighlight />}

        {/* Main Content */}
        {currentScreen === 'companion' && (
          <CivicCompanion accessToken={accessToken} onBack={handleBack} initialQuery={voiceQuery} />
        )}
        {currentScreen === 'documents' && (
          <DocumentWalletEnhanced accessToken={accessToken} onBack={handleBack} />
        )}
        {currentScreen === 'schemes' && (
          <SchemeFinder accessToken={accessToken} onBack={handleBack} />
        )}
        {currentScreen === 'complaints' && (
          <ComplaintSupport accessToken={accessToken} onBack={handleBack} />
        )}
        {currentScreen === 'profile' && (
          <UserProfile accessToken={accessToken} onBack={handleBack} />
        )}
        {currentScreen === 'dashboard' && (
          <Dashboard
            userName={userName}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            onShowFeatures={() => setShowFeatureHighlight(true)}
          />
        )}

        {/* Voice Assistant - Always Available */}
        <VoiceAssistant 
          onVoiceCommand={handleVoiceCommand} 
          currentScreen={currentScreen}
        />
      </div>
    </LanguageProvider>
  );
}
