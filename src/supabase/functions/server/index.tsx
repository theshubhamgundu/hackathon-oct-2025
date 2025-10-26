import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase clients
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

// Create storage bucket on startup
const bucketName = 'make-8457b97f-documents';
try {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
  if (!bucketExists) {
    await supabaseAdmin.storage.createBucket(bucketName, { public: false });
    console.log(`Created storage bucket: ${bucketName}`);
  }
} catch (error) {
  console.log(`Storage bucket creation error (may already exist): ${error}`);
}

// Health check endpoint
app.get("/make-server-8457b97f/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-8457b97f/signup", async (c) => {
  try {
    const { email, password, name, age, occupation, income } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    // Create user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      age: age || null,
      occupation: occupation || null,
      income: income || null,
      location: null,
      createdAt: new Date().toISOString()
    });

    // Initialize empty documents array
    await kv.set(`documents:${data.user.id}`, []);

    return c.json({ success: true, userId: data.user.id });
  } catch (error) {
    console.log(`Signup processing error: ${error}`);
    return c.json({ error: 'Failed to create account' }, 500);
  }
});

// Update user profile
app.post("/make-server-8457b97f/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const updates = await c.req.json();
    const existingProfile = await kv.get(`user:${user.id}`);
    
    const updatedProfile = {
      ...existingProfile,
      ...updates,
      id: user.id
    };

    await kv.set(`user:${user.id}`, updatedProfile);
    
    return c.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.log(`Profile update error: ${error}`);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Get user profile
app.get("/make-server-8457b97f/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    
    return c.json({ profile });
  } catch (error) {
    console.log(`Profile fetch error: ${error}`);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Civic Companion Chat endpoint
app.post("/make-server-8457b97f/chat", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { message } = await c.req.json();
    
    if (!message) {
      return c.json({ error: 'Message is required' }, 400);
    }

    // Simulated AI response - In production, integrate with OpenAI API
    const responses: Record<string, string> = {
      'ration card': '**How to Apply for a New Ration Card:**\n\n1. Visit your State Food & Civil Supplies website or local office\n2. Fill the application form with family details\n3. Attach required documents:\n   - Address proof (Aadhaar/Voter ID)\n   - Income certificate\n   - Passport-size photos\n4. Submit at the nearest Fair Price Shop or online portal\n5. Track status using application reference number\n\n**Helpful Link:** [National Food Security Portal](https://nfsa.gov.in/)',
      'aadhaar': '**Aadhaar Update Center Near You:**\n\nYou can update your Aadhaar at any permanent Aadhaar Seva Kendra. To find the nearest center:\n\n1. Visit [UIDAI Aadhaar Centers](https://appointments.uidai.gov.in/)\n2. Enter your pin code or city\n3. Select the nearest center and book appointment\n\n**Required Documents:**\n- Original Aadhaar card\n- Proof of Identity and Address\n- Mobile number for OTP verification\n\n**Update Fee:** ₹50 for most updates',
      'pan': '**Documents Needed to Update PAN Address:**\n\n1. PAN card copy\n2. Address proof (any one):\n   - Aadhaar card\n   - Passport\n   - Voter ID\n   - Bank statement (last 3 months)\n   - Electricity/water bill\n\n**How to Update:**\n- Online: Visit [NSDL PAN Portal](https://www.onlineservices.nsdl.com/)\n- Fill Form 49A and upload documents\n- Pay ₹110 processing fee\n- Receive updated PAN in 15-20 days',
      'default': 'I can help you with various government services including:\n\n• Ration card applications\n• Aadhaar updates and services\n• PAN card procedures\n• Passport applications\n• Driving license renewals\n• Voter ID registration\n• Municipal office information\n\nPlease ask me a specific question about any government service!'
    };

    const lowerMessage = message.toLowerCase();
    let response = responses.default;
    
    if (lowerMessage.includes('ration')) response = responses['ration card'];
    else if (lowerMessage.includes('aadhaar')) response = responses['aadhaar'];
    else if (lowerMessage.includes('pan')) response = responses['pan'];

    return c.json({ 
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.log(`Chat processing error: ${error}`);
    return c.json({ error: 'Failed to process message' }, 500);
  }
});

// Upload document
app.post("/make-server-8457b97f/documents/upload", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('type') as string;
    const documentName = formData.get('name') as string;

    if (!file || !documentType || !documentName) {
      return c.json({ error: 'File, type, and name are required' }, 400);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}_${documentType}.${fileExt}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, file);

    if (uploadError) {
      console.log(`Document upload error: ${uploadError.message}`);
      return c.json({ error: 'Failed to upload document' }, 500);
    }

    // Create signed URL (valid for 1 year)
    const { data: urlData } = await supabaseAdmin.storage
      .from(bucketName)
      .createSignedUrl(fileName, 31536000);

    // Store document metadata
    const documents = await kv.get(`documents:${user.id}`) || [];
    const newDocument = {
      id: crypto.randomUUID(),
      name: documentName,
      type: documentType,
      fileName: fileName,
      url: urlData?.signedUrl,
      uploadedAt: new Date().toISOString(),
      size: file.size
    };

    documents.push(newDocument);
    await kv.set(`documents:${user.id}`, documents);

    return c.json({ success: true, document: newDocument });
  } catch (error) {
    console.log(`Document upload processing error: ${error}`);
    return c.json({ error: 'Failed to upload document' }, 500);
  }
});

// Get all documents
app.get("/make-server-8457b97f/documents", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const documents = await kv.get(`documents:${user.id}`) || [];
    
    return c.json({ documents });
  } catch (error) {
    console.log(`Documents fetch error: ${error}`);
    return c.json({ error: 'Failed to fetch documents' }, 500);
  }
});

// Delete document
app.delete("/make-server-8457b97f/documents/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const documentId = c.req.param('id');
    const documents = await kv.get(`documents:${user.id}`) || [];
    const document = documents.find((d: any) => d.id === documentId);

    if (!document) {
      return c.json({ error: 'Document not found' }, 404);
    }

    // Delete from storage
    await supabaseAdmin.storage.from(bucketName).remove([document.fileName]);

    // Remove from KV store
    const updatedDocuments = documents.filter((d: any) => d.id !== documentId);
    await kv.set(`documents:${user.id}`, updatedDocuments);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Document deletion error: ${error}`);
    return c.json({ error: 'Failed to delete document' }, 500);
  }
});

// Get schemes by location
app.post("/make-server-8457b97f/schemes", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { state, district, age, income, occupation } = await c.req.json();

    if (!state) {
      return c.json({ error: 'State is required' }, 400);
    }

    // Simulated scheme database - In production, integrate with MyScheme API
    const allSchemes = {
      'Bihar': [
        {
          id: 'bihar-1',
          name: 'Bihar Student Credit Card',
          description: 'Education loan up to ₹4 lakh for students pursuing higher education',
          eligibility: 'Age: 18-25, Resident of Bihar, Admitted to recognized institution',
          benefits: 'Interest-free loan, No collateral required',
          applyLink: 'https://www.7nishchay-yuvaupmission.bihar.gov.in/'
        },
        {
          id: 'bihar-2',
          name: 'Mukhyamantri Kanya Utthan Yojana',
          description: 'Financial assistance of ₹54,100 for girl child education',
          eligibility: 'Girl students, Resident of Bihar',
          benefits: 'Cash assistance at different education stages',
          applyLink: 'https://medhasoft.bih.nic.in/'
        }
      ],
      'Maharashtra': [
        {
          id: 'maha-1',
          name: 'Mahatma Jyotiba Phule Jan Arogya Yojana',
          description: 'Free health insurance up to ₹1.5 lakh for BPL families',
          eligibility: 'BPL card holders, Annual income < ₹1 lakh',
          benefits: 'Free treatment at empanelled hospitals',
          applyLink: 'https://www.jeevandayee.gov.in/'
        },
        {
          id: 'maha-2',
          name: 'Ramai Awas Yojana',
          description: 'Housing scheme for slum dwellers',
          eligibility: 'Slum residents, Maharashtra domicile',
          benefits: 'Affordable housing units',
          applyLink: 'https://mahacityslum.com/'
        }
      ],
      'Central': [
        {
          id: 'central-1',
          name: 'PM Awas Yojana - Gramin',
          description: 'Financial assistance of ₹1.2 lakh for rural housing',
          eligibility: 'Rural residents, Houseless or kutcha house',
          benefits: 'Construction assistance, Toilet unit',
          applyLink: 'https://pmayg.nic.in/'
        },
        {
          id: 'central-2',
          name: 'Ayushman Bharat - PM-JAY',
          description: 'Health cover of ₹5 lakh per family per year',
          eligibility: 'Based on SECC 2011 data, Economically weaker sections',
          benefits: 'Cashless treatment at empanelled hospitals',
          applyLink: 'https://pmjay.gov.in/'
        },
        {
          id: 'central-3',
          name: 'Pradhan Mantri Kisan Samman Nidhi',
          description: '₹6,000 per year in three installments for farmers',
          eligibility: 'Small and marginal farmers, Landholding up to 2 hectares',
          benefits: 'Direct income support',
          applyLink: 'https://pmkisan.gov.in/'
        }
      ]
    };

    const stateSchemes = allSchemes[state as keyof typeof allSchemes] || [];
    const centralSchemes = allSchemes['Central'];
    const schemes = [...stateSchemes, ...centralSchemes];

    return c.json({ schemes, state, district });
  } catch (error) {
    console.log(`Schemes fetch error: ${error}`);
    return c.json({ error: 'Failed to fetch schemes' }, 500);
  }
});

// File complaint
app.post("/make-server-8457b97f/complaints", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { type, description, location } = await c.req.json();

    if (!type || !description) {
      return c.json({ error: 'Type and description are required' }, 400);
    }

    const complaintId = crypto.randomUUID();
    const complaint = {
      id: complaintId,
      userId: user.id,
      type,
      description,
      location: location || null,
      status: 'Submitted',
      department: getDepartment(type),
      submittedAt: new Date().toISOString(),
      updates: []
    };

    await kv.set(`complaint:${user.id}:${complaintId}`, complaint);

    return c.json({ success: true, complaint });
  } catch (error) {
    console.log(`Complaint filing error: ${error}`);
    return c.json({ error: 'Failed to file complaint' }, 500);
  }
});

// Get user complaints
app.get("/make-server-8457b97f/complaints", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const complaints = await kv.getByPrefix(`complaint:${user.id}:`);
    
    return c.json({ complaints });
  } catch (error) {
    console.log(`Complaints fetch error: ${error}`);
    return c.json({ error: 'Failed to fetch complaints' }, 500);
  }
});

// Family member management endpoints

// Add family member
app.post("/make-server-8457b97f/family/add", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { name, email, relation, canEdit } = await c.req.json();

    if (!name || !email || !relation) {
      return c.json({ error: 'Name, email, and relation are required' }, 400);
    }

    const familyMembers = await kv.get(`family:${user.id}`) || [];
    const memberId = crypto.randomUUID();
    
    const newMember = {
      id: memberId,
      name,
      email,
      relation,
      canEdit: canEdit || false,
      addedAt: new Date().toISOString(),
      addedBy: user.id
    };

    familyMembers.push(newMember);
    await kv.set(`family:${user.id}`, familyMembers);

    // Create reverse mapping for member to access owner's documents
    await kv.set(`family:access:${email}:${user.id}`, {
      ownerId: user.id,
      ownerEmail: user.email,
      canEdit: canEdit || false
    });

    return c.json({ success: true, member: newMember });
  } catch (error) {
    console.log(`Add family member error: ${error}`);
    return c.json({ error: 'Failed to add family member' }, 500);
  }
});

// Get family members
app.get("/make-server-8457b97f/family", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const familyMembers = await kv.get(`family:${user.id}`) || [];
    
    return c.json({ familyMembers });
  } catch (error) {
    console.log(`Get family members error: ${error}`);
    return c.json({ error: 'Failed to fetch family members' }, 500);
  }
});

// Remove family member
app.delete("/make-server-8457b97f/family/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const memberId = c.req.param('id');
    const familyMembers = await kv.get(`family:${user.id}`) || [];
    const member = familyMembers.find((m: any) => m.id === memberId);

    if (!member) {
      return c.json({ error: 'Family member not found' }, 404);
    }

    // Remove member from family list
    const updatedMembers = familyMembers.filter((m: any) => m.id !== memberId);
    await kv.set(`family:${user.id}`, updatedMembers);

    // Remove access mapping
    await kv.del(`family:access:${member.email}:${user.id}`);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Remove family member error: ${error}`);
    return c.json({ error: 'Failed to remove family member' }, 500);
  }
});

// Get documents accessible to user (own + shared by family)
app.get("/make-server-8457b97f/documents/all", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get own documents
    const ownDocuments = await kv.get(`documents:${user.id}`) || [];

    // Get documents shared by family members
    const accessKeys = await kv.getByPrefix(`family:access:${user.email}:`);
    const sharedDocuments = [];

    for (const accessKey of accessKeys) {
      const ownerId = accessKey.ownerId;
      const ownerDocs = await kv.get(`documents:${ownerId}`) || [];
      
      for (const doc of ownerDocs) {
        sharedDocuments.push({
          ...doc,
          ownerId,
          ownerEmail: accessKey.ownerEmail,
          sharedDocument: true,
          canEdit: accessKey.canEdit
        });
      }
    }

    return c.json({ 
      ownDocuments, 
      sharedDocuments,
      totalDocuments: ownDocuments.length + sharedDocuments.length
    });
  } catch (error) {
    console.log(`Get all documents error: ${error}`);
    return c.json({ error: 'Failed to fetch documents' }, 500);
  }
});

// AI Translation endpoint
app.post("/make-server-8457b97f/translate", async (c) => {
  try {
    const { text, targetLanguage } = await c.req.json();

    if (!text || !targetLanguage) {
      return c.json({ error: 'Text and target language are required' }, 400);
    }

    // Simple translation map for common phrases
    // In production, integrate with Google Translate API or similar
    const translations: Record<string, Record<string, string>> = {
      'hi': { // Hindi
        'Dashboard': 'डैशबोर्ड',
        'Civic Life Companion': 'नागरिक जीवन साथी',
        'e-Document Wallet': 'ई-दस्तावेज़ वॉलेट',
        'Scheme Finder': 'योजना खोजक',
        'Complaint Support': 'शिकायत सहायता',
        'Welcome': 'स्वागत है',
        'Logout': 'लॉग आउट',
        'Profile': 'प्रोफ़ाइल'
      },
      'ta': { // Tamil
        'Dashboard': 'டாஷ்போர்டு',
        'Civic Life Companion': 'குடிமை வாழ்க்கை துணை',
        'e-Document Wallet': 'மின் ஆவண பணப்பை',
        'Scheme Finder': 'திட்ட கண்டுபிடிப்பாளர்',
        'Complaint Support': 'புகார் ஆதரவு'
      }
    };

    const translated = translations[targetLanguage]?.[text] || text;
    
    return c.json({ translatedText: translated });
  } catch (error) {
    console.log(`Translation error: ${error}`);
    return c.json({ error: 'Translation failed' }, 500);
  }
});

// Analyze document and generate system instructions
app.post("/make-server-8457b97f/analyze-document", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { documentContent, fileName } = await c.req.json();
    
    if (!documentContent) {
      return c.json({ error: 'Document content is required' }, 400);
    }

    // Analyze document content and generate system instructions
    const systemInstructions = generateSystemInstructions(documentContent, fileName);

    return c.json({ 
      systemInstructions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.log(`Document analysis error: ${error}`);
    return c.json({ error: 'Failed to analyze document' }, 500);
  }
});

// Helper function to generate system instructions from document content
function generateSystemInstructions(content: string, fileName: string): string {
  const contentLower = content.toLowerCase();
  
  // Detect document type and content
  const isGovernmentDoc = contentLower.includes('government') || 
                          contentLower.includes('ministry') || 
                          contentLower.includes('department') ||
                          contentLower.includes('act') ||
                          contentLower.includes('scheme');
  
  const isScheme = contentLower.includes('scheme') || 
                   contentLower.includes('subsidy') || 
                   contentLower.includes('grant') ||
                   contentLower.includes('benefit');
  
  const isServiceGuide = contentLower.includes('how to') || 
                         contentLower.includes('procedure') || 
                         contentLower.includes('process') ||
                         contentLower.includes('application');
  
  const isPolicy = contentLower.includes('policy') || 
                   contentLower.includes('regulation') || 
                   contentLower.includes('rule');

  // Extract key topics from content
  const keyTopics = extractKeyTopics(content);
  
  // Generate system instructions based on document analysis
  let instructions = `# Civic Life Companion - System Instructions\n\n`;
  instructions += `**Document:** ${fileName}\n`;
  instructions += `**Analysis Date:** ${new Date().toISOString()}\n\n`;
  
  instructions += `## Document Classification\n`;
  
  if (isGovernmentDoc) {
    instructions += `- **Type:** Government Document\n`;
  }
  if (isScheme) {
    instructions += `- **Category:** Government Scheme/Benefit\n`;
  }
  if (isServiceGuide) {
    instructions += `- **Category:** Service/Procedure Guide\n`;
  }
  if (isPolicy) {
    instructions += `- **Category:** Policy/Regulation\n`;
  }
  
  instructions += `\n## Key Topics Identified\n`;
  keyTopics.forEach(topic => {
    instructions += `- ${topic}\n`;
  });
  
  // Extract and summarize important information
  const summary = extractDocumentSummary(content);
  if (summary) {
    instructions += `\n## Document Summary\n${summary}\n`;
  }
  
  // Generate civic guidance based on document content
  instructions += `\n## Civic Life Companion Guidance\n`;
  instructions += generateCivicGuidance(content, keyTopics);
  
  // Add action items
  instructions += `\n## Recommended Actions\n`;
  instructions += generateActionItems(content, keyTopics);
  
  return instructions;
}

// Extract key topics from document
function extractKeyTopics(content: string): string[] {
  const topics: Set<string> = new Set();
  
  const keywords = [
    'aadhaar', 'pan', 'ration card', 'passport', 'driving license',
    'voter id', 'aadhar', 'income certificate', 'caste certificate',
    'domicile', 'birth certificate', 'death certificate', 'marriage certificate',
    'property', 'land', 'electricity', 'water', 'gas', 'pension',
    'scholarship', 'loan', 'subsidy', 'grant', 'benefit', 'scheme',
    'application', 'registration', 'renewal', 'update', 'correction',
    'complaint', 'grievance', 'appeal', 'verification', 'approval'
  ];
  
  const contentLower = content.toLowerCase();
  
  keywords.forEach(keyword => {
    if (contentLower.includes(keyword)) {
      topics.add(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  });
  
  // Extract sentences containing important terms
  const sentences = content.split(/[.!?]+/).slice(0, 5);
  sentences.forEach(sentence => {
    const trimmed = sentence.trim();
    if (trimmed.length > 20 && trimmed.length < 150) {
      topics.add(trimmed.substring(0, 100) + '...');
    }
  });
  
  return Array.from(topics).slice(0, 10);
}

// Extract document summary
function extractDocumentSummary(content: string): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const summary = sentences.slice(0, 3).join('. ').trim();
  return summary.length > 0 ? summary + '.' : '';
}

// Generate civic guidance based on document
function generateCivicGuidance(content: string, topics: string[]): string {
  let guidance = '';
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('aadhaar') || contentLower.includes('aadhar')) {
    guidance += `**Aadhaar Services:** This document relates to Aadhaar. You can update your Aadhaar at any Aadhaar Seva Kendra. Visit [UIDAI Portal](https://uidai.gov.in/) for more information.\n\n`;
  }
  
  if (contentLower.includes('ration') || contentLower.includes('food')) {
    guidance += `**Ration Card:** For ration card services, visit your State Food & Civil Supplies website or local Fair Price Shop.\n\n`;
  }
  
  if (contentLower.includes('passport')) {
    guidance += `**Passport Services:** Apply for passport at your nearest Passport Seva Kendra. Visit [Passport India](https://www.passportindia.gov.in/) for appointments.\n\n`;
  }
  
  if (contentLower.includes('pan')) {
    guidance += `**PAN Card:** Update or apply for PAN at [NSDL Portal](https://www.onlineservices.nsdl.com/). Processing takes 15-20 days.\n\n`;
  }
  
  if (contentLower.includes('scheme') || contentLower.includes('benefit') || contentLower.includes('subsidy')) {
    guidance += `**Government Schemes:** Check your eligibility for various government schemes at [PM Schemes Portal](https://www.pib.gov.in/).\n\n`;
  }
  
  if (contentLower.includes('complaint') || contentLower.includes('grievance')) {
    guidance += `**File Complaint:** You can file complaints through this app or visit your local municipal office.\n\n`;
  }
  
  if (guidance.length === 0) {
    guidance = `**General Civic Services:** This document relates to government services. Please refer to the relevant department or visit the official government portal for more information.\n\n`;
  }
  
  return guidance;
}

// Generate action items based on document
function generateActionItems(content: string, topics: string[]): string {
  let actions = '';
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('application') || contentLower.includes('apply')) {
    actions += `1. Prepare required documents as mentioned in the document\n`;
    actions += `2. Visit the appropriate government office or portal\n`;
    actions += `3. Fill out the application form completely\n`;
    actions += `4. Submit and keep the reference number for tracking\n`;
  } else if (contentLower.includes('renewal') || contentLower.includes('update')) {
    actions += `1. Check the expiry date of your document\n`;
    actions += `2. Gather required documents for renewal/update\n`;
    actions += `3. Visit the relevant office or use online portal\n`;
    actions += `4. Complete the renewal/update process\n`;
  } else if (contentLower.includes('scheme') || contentLower.includes('benefit')) {
    actions += `1. Verify your eligibility for the scheme\n`;
    actions += `2. Collect required documents\n`;
    actions += `3. Submit application through official channel\n`;
    actions += `4. Track application status regularly\n`;
  } else {
    actions += `1. Review the document carefully\n`;
    actions += `2. Identify relevant sections for your needs\n`;
    actions += `3. Contact the appropriate government department\n`;
    actions += `4. Follow the prescribed procedure\n`;
  }
  
  return actions;
}

// Helper function to determine department
function getDepartment(type: string): string {
  const departmentMap: Record<string, string> = {
    'streetlight': 'Municipal Electrical Department',
    'water': 'Water Supply Department',
    'drainage': 'Public Works Department',
    'garbage': 'Solid Waste Management',
    'road': 'Public Works Department',
    'power': 'Electricity Board'
  };

  const lowerType = type.toLowerCase();
  for (const key in departmentMap) {
    if (lowerType.includes(key)) {
      return departmentMap[key];
    }
  }

  return 'Municipal Corporation';
}

Deno.serve(app.fetch);