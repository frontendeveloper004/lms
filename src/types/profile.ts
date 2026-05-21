export interface CertificateCard {
  id: string;
  issuedAt: string;
  course: { title: string };
}

export interface StudentProfileResponse {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  coverPhoto: string | null;
  bio: string | null;
  location: string | null;
  goal: string | null;
  skills: string[];
  linkedinUrl: string | null;
  githubUrl: string | null;
  telegramUrl: string | null;
  websiteUrl: string | null;
  xpPoints: number;
  createdAt: string;
  stats: {
    enrollmentCount: number;
    certificateCount: number;
    learningStreak: number;
    completedCount: number;
    activeCount: number;
  };
  activeCourses: {
    id: string; title: string; image: string | null;
    level: string; category: string; progress: number;
  }[];
  completedCourses: {
    id: string; title: string; image: string | null;
    level: string; category: string;
  }[];
  recentCertificates: CertificateCard[];
}

export interface CourseListItem {
  id: string;
  title: string;
  status: string;
}

export interface TeacherProject {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  imageUrl: string | null;
  orderIdx: number;
}

export interface TeacherCertificate {
  id: string;
  name: string;
  issuer: string | null;
  year: number | null;
  imageUrl: string | null;
  orderIdx: number;
}

export interface PublicCourseItem {
  id: string;
  title: string;
  image: string | null;
  level: string;
  price: number;
  enrollmentCount: number;
}

export interface TeacherProfileResponse {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  coverPhoto: string | null;
  bio: string | null;
  specialization: string | null;
  skills: string[];
  linkedinUrl: string | null;
  githubUrl: string | null;
  youtubeUrl: string | null;
  telegramUrl: string | null;
  websiteUrl: string | null;
  subjectType: string;
  teachingExperience: string | null;
  languages: string | null;
  availability: string | null;
  lessonFormat: string | null;
  universityDegree: string | null;
  teachingMaterials: string | null;
  studentResults: string | null;
  lessonPrice: number | null;
  ieltsScore: number | null;
  hasTesolTefl: boolean;
  hasTrialLesson: boolean;
  whatsappUrl: string | null;
  createdAt: string;
  stats: {
    courseCount: number;
    uniqueStudentCount: number;
  };
  courses: CourseListItem[];
}

export interface PublicTeacherProfile {
  id: string;
  name: string;
  avatar: string | null;
  coverPhoto: string | null;
  bio: string | null;
  specialization: string | null;
  skills: string[];
  linkedinUrl: string | null;
  githubUrl: string | null;
  youtubeUrl: string | null;
  telegramUrl: string | null;
  websiteUrl: string | null;
  teachingExperience: string | null;
  languages: string | null;
  availability: string | null;
  lessonFormat: string | null;
  universityDegree: string | null;
  teachingMaterials: string | null;
  studentResults: string | null;
  lessonPrice: number | null;
  ieltsScore: number | null;
  hasTesolTefl: boolean;
  hasTrialLesson: boolean;
  whatsappUrl: string | null;
  createdAt: string;
  stats: {
    courseCount: number;
    uniqueStudentCount: number;
  };
  courses: PublicCourseItem[];
  projects: TeacherProject[];
  certificates: TeacherCertificate[];
}

export interface AdminProfileResponse {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  createdAt: string;
  stats: {
    totalUsers: number;
    approvedCourses: number;
    pendingCourses: number;
  };
}
