import { useState, useEffect } from 'react';
import { ArrowLeft, Upload, FileText, Download, Trash2, Loader2, AlertCircle, Users, UserPlus, X, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { API_BASE_URL } from '../utils/supabase-client';

interface Document {
  id: string;
  name: string;
  type: string;
  fileName: string;
  url: string;
  uploadedAt: string;
  size: number;
  ownerId?: string;
  ownerEmail?: string;
  sharedDocument?: boolean;
  canEdit?: boolean;
}

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  relation: string;
  canEdit: boolean;
  addedAt: string;
}

interface DocumentWalletEnhancedProps {
  accessToken: string;
  onBack: () => void;
}

export function DocumentWalletEnhanced({ accessToken, onBack }: DocumentWalletEnhancedProps) {
  const [ownDocuments, setOwnDocuments] = useState<Document[]>([]);
  const [sharedDocuments, setSharedDocuments] = useState<Document[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [familyDialogOpen, setFamilyDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('my-documents');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchDocuments(),
      fetchFamilyMembers()
    ]);
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/all`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch documents');
      }

      setOwnDocuments(data.ownDocuments || []);
      setSharedDocuments(data.sharedDocuments || []);
    } catch (error: any) {
      console.error('Fetch documents error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFamilyMembers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/family`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setFamilyMembers(data.familyMembers || []);
      }
    } catch (error: any) {
      console.error('Fetch family members error:', error);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;

    if (!file || !name || !type) {
      setError('Please fill all fields');
      setIsUploading(false);
      return;
    }

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('name', name);
      uploadFormData.append('type', type);

      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: uploadFormData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload document');
      }

      setOwnDocuments(prev => [...prev, data.document]);
      setUploadDialogOpen(false);
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete document');
      }

      setOwnDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (error: any) {
      console.error('Delete error:', error);
      setError(error.message);
    }
  };

  const handleAddFamilyMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const relation = formData.get('relation') as string;
    const canEdit = formData.get('canEdit') === 'on';

    try {
      const response = await fetch(`${API_BASE_URL}/family/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ name, email, relation, canEdit })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add family member');
      }

      setFamilyMembers(prev => [...prev, data.member]);
      setFamilyDialogOpen(false);
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error('Add family member error:', error);
      setError(error.message);
    }
  };

  const handleRemoveFamilyMember = async (memberId: string) => {
    if (!confirm('Remove this family member? They will lose access to your documents.')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/family/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove family member');
      }

      setFamilyMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (error: any) {
      console.error('Remove family member error:', error);
      setError(error.message);
    }
  };

  const documentTypes = [
    'Aadhaar Card',
    'PAN Card',
    'Voter ID',
    'Driving License',
    'Passport',
    'Ration Card',
    'Income Certificate',
    'Caste Certificate',
    'Land Documents',
    'Other'
  ];

  const relations = [
    'Spouse',
    'Parent',
    'Child',
    'Sibling',
    'Grandparent',
    'Other Family'
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const DocumentCard = ({ doc, isShared }: { doc: Document; isShared: boolean }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              {doc.name}
              {isShared && (
                <Badge variant="secondary" className="text-xs">
                  <Share2 className="w-3 h-3 mr-1" />
                  Shared
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{doc.type}</CardDescription>
            {isShared && doc.ownerEmail && (
              <p className="text-xs text-gray-500 mt-1">Owner: {doc.ownerEmail}</p>
            )}
          </div>
          <FileText className="w-8 h-8 text-green-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <p>Size: {formatFileSize(doc.size)}</p>
          <p>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => window.open(doc.url, '_blank')}
          >
            <Download className="w-4 h-4 mr-1" />
            View
          </Button>
          {!isShared && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(doc.id)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <h2>e-Document Wallet</h2>
              <p className="text-sm text-gray-600">Manage family documents securely</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={familyDialogOpen} onOpenChange={setFamilyDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Family ({familyMembers.length})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Family Members</DialogTitle>
                  <DialogDescription>
                    Add family members to share documents with them in real-time
                  </DialogDescription>
                </DialogHeader>
                
                {/* Add Family Member Form */}
                <form onSubmit={handleAddFamilyMember} className="space-y-4 border-b pb-4">
                  <div className="space-y-2">
                    <Label htmlFor="member-name">Name</Label>
                    <Input id="member-name" name="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="member-email">Email</Label>
                    <Input id="member-email" name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="member-relation">Relation</Label>
                    <Select name="relation" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relation" />
                      </SelectTrigger>
                      <SelectContent>
                        {relations.map((rel) => (
                          <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="can-edit" name="canEdit" />
                    <Label htmlFor="can-edit">Allow editing documents</Label>
                  </div>
                  <Button type="submit" className="w-full">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Family Member
                  </Button>
                </form>

                {/* Family Members List */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {familyMembers.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No family members added yet
                    </p>
                  ) : (
                    familyMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.email} • {member.relation}</p>
                          {member.canEdit && (
                            <Badge variant="secondary" className="text-xs mt-1">Can Edit</Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFamilyMember(member.id)}
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload New Document</DialogTitle>
                  <DialogDescription>
                    Add a document that will be accessible to your family members
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="doc-name">Document Name</Label>
                    <Input id="doc-name" name="name" placeholder="e.g., My Aadhaar Card" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doc-type">Document Type</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doc-file">Select File</Label>
                    <Input id="doc-file" name="file" type="file" accept=".pdf,.jpg,.jpeg,.png" required />
                    <p className="text-xs text-gray-500">Supported: PDF, JPG, PNG (Max 10MB)</p>
                  </div>
                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </>
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="my-documents">
              My Documents ({ownDocuments.length})
            </TabsTrigger>
            <TabsTrigger value="family-shared">
              Family Shared ({sharedDocuments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-documents">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : ownDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="mb-2">No documents yet</h3>
                <p className="text-gray-600 mb-6">
                  Upload your documents to share with family members
                </p>
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Your First Document
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ownDocuments.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} isShared={false} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="family-shared">
            {sharedDocuments.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="mb-2">No shared documents</h3>
                <p className="text-gray-600 mb-6">
                  Family members haven't shared any documents with you yet
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sharedDocuments.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} isShared={true} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <div className="mt-12 bg-green-50 rounded-lg p-6">
          <h3 className="mb-2 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            Family Document Sharing
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span><strong>Real-time Access:</strong> Family members see your documents instantly when you upload them</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span><strong>Secure Sharing:</strong> Only people you explicitly add can access your documents</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span><strong>Permission Control:</strong> Choose whether family members can edit or only view</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span><strong>Easy Management:</strong> Add or remove family members anytime</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
