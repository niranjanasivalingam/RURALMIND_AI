export interface UserLocation {
  panchayat?: string;
  taluk?: string;
  district?: string;
  state: string;
}

export interface UserDemographics {
  age?: number;
  annualIncome?: number;
  occupation?: string;
  landSize?: string;
  hasBPLCard?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Citizen' | 'Panchayat Officer' | 'Taluk Officer' | 'District Officer' | 'State Officer' | 'Admin';
  phone: string;
  location: UserLocation;
  demographics?: UserDemographics;
}

export interface TrackingNode {
  timestamp: string;
  status: string;
  actor: string;
  remarks: string;
}

export interface ImageAnalysis {
  isAuthenticIssue: boolean;
  detectedObjects: string[];
  estimatedSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  imageDescription: string;
}

export interface DuplicateCheck {
  isDuplicate: boolean;
  duplicateOfId: string | null;
  explanation: string;
}

export interface ComplaintFeedback {
  rating: number;
  remarks: string;
  timestamp: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  location: {
    panchayat: string;
    taluk: string;
    district: string;
    state: string;
    address: string;
  };
  assignedAuthority: string;
  imageUrl: string | null;
  duplicateGroupId: string | null;
  createdDate: string;
  userEmail: string;
  trackingTimeline: TrackingNode[];
  feedback: ComplaintFeedback | null;
  imageAnalysis?: ImageAnalysis | null;
  duplicateCheck?: DuplicateCheck | null;
}

export interface PublicAsset {
  id: string;
  name: string;
  category: string;
  location: string;
  healthStatus: 'EXCELLENT' | 'GOOD' | 'NEEDS_REPAIR' | 'BROKEN';
  lastMaintained: string;
  description: string;
}

export interface DevelopmentProject {
  id: string;
  name: string;
  description: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'HALTED';
  progress: number;
  budget: string;
  startDate: string;
  completionDate: string;
  authority: string;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  description: string;
  benefit: string;
  category: string;
  eligibility: {
    occupation?: string;
    incomeLimit?: number;
    landSizeMin?: number;
    landSizeMax?: number;
    hasBPLCard?: boolean;
    ageMin?: number;
    ageMax?: number;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export interface OfficerPerformance {
  name: string;
  role: string;
  department: string;
  resolved: number;
  pending: number;
  rating: number;
  onTimeCompletion: string;
}

export interface NotificationLog {
  id: string;
  type: 'SMS' | 'Email';
  recipient: string;
  subject: string;
  message: string;
  timestamp: string;
}
