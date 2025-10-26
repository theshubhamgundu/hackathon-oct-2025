import { MessageSquare, FileText, Gift, AlertCircle, User, LogOut, Languages, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useLanguage, SUPPORTED_LANGUAGES } from '../utils/language-context';

interface DashboardProps {
  userName: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
  onShowFeatures?: () => void;
}

export function Dashboard({ userName, onNavigate, onLogout, onShowFeatures }: DashboardProps) {
  const { currentLanguage, setLanguage, t } = useLanguage();

  const modules = [
    {
      id: 'companion',
      title: t('civic-companion'),
      description: t('ask-questions'),
      icon: MessageSquare,
      color: 'bg-blue-500'
    },
    {
      id: 'documents',
      title: t('document-wallet'),
      description: t('manage-documents'),
      icon: FileText,
      color: 'bg-green-500'
    },
    {
      id: 'schemes',
      title: t('scheme-finder'),
      description: t('discover-schemes'),
      icon: Gift,
      color: 'bg-purple-500'
    },
    {
      id: 'complaints',
      title: t('complaint-support'),
      description: t('file-complaints'),
      icon: AlertCircle,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2">
              🇮🇳 JanAI
            </h1>
            <p className="text-sm text-gray-600">{t('welcome')}, {userName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Select 
              value={currentLanguage.code} 
              onValueChange={(code) => {
                const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
                if (lang) setLanguage(lang);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.nativeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => onNavigate('profile')}>
              <User className="w-4 h-4 mr-1" />
              {t('profile')}
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-1" />
              {t('logout')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* New Features Banner */}
        {onShowFeatures && (
          <div className="mb-6 bg-gradient-to-r from-orange-100 to-green-100 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-orange-600" />
              <div>
                <h3 className="text-sm">🎉 New Features Available!</h3>
                <p className="text-xs text-gray-600">Voice AI, Multilingual Support & Family Sharing</p>
              </div>
            </div>
            <Button size="sm" onClick={onShowFeatures}>
              Learn More
            </Button>
          </div>
        )}

        <div className="mb-8">
          <h2 className="mb-2">{t('your-civic-dashboard')}</h2>
          <p className="text-gray-600">
            {t('access-government-services')}
          </p>
        </div>

        {/* Module Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onNavigate(module.id)}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`${module.color} p-3 rounded-lg text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle>{module.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {module.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Quick Info */}
        <div className="mt-12 bg-gradient-to-r from-orange-100 to-green-100 rounded-lg p-6">
          <h3 className="mb-2">About JanAI</h3>
          <p className="text-gray-700 mb-4">
            JanAI is your intelligent civic-tech assistant that simplifies government interactions.
            Get instant answers, manage documents, discover welfare schemes, and raise civic issues — all in one place.
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/50 rounded p-3">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>24/7 Support</span>
              </div>
              <p className="text-gray-600 text-xs">Get instant answers to government queries</p>
            </div>
            <div className="bg-white/50 rounded p-3">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-green-600" />
                <span>Secure Storage</span>
              </div>
              <p className="text-gray-600 text-xs">Keep all documents safe and organized</p>
            </div>
            <div className="bg-white/50 rounded p-3">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-4 h-4 text-purple-600" />
                <span>Smart Discovery</span>
              </div>
              <p className="text-gray-600 text-xs">Find schemes you're eligible for</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
