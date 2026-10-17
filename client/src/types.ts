export interface Pillar {
  id: string;
  name: string;
  shortName: string;
  iconName: string;
  description: string;
}

export interface Question {
  id: number;
  pillarId: string;
  pillarName: string;
  text: string;
}

export interface AnswerOption {
  label: string;
  value: number;
}

export interface ScoreBand {
  id: string;
  min: number;
  max: number;
  zone: string;
  emoji: string;
  title: string;
  badgeTheme: string;
  headline: string;
  reassurance: string;
  firstMoveTitle: string;
  firstMoveRule: string;
  firstMoveAdvice: string;
  pathwayTitle: string;
  pathwaySteps: string[];
  pathwayDescription: string;
  evidenceNote: string;
}

export interface ReportPayload {
  heading: string;
  subheading: string;
  score: number;
  maxScore: number;
  scoreBand: ScoreBand;
}

export interface AssessmentMeta {
  brand: string;
  tagline: string;
  pillars: Pillar[];
  questions: Question[];
  options: AnswerOption[];
  totalQuestions: number;
}

export interface LeadFormData {
  fullName: string;
  email: string;
  mobile: string;
  consent: boolean;
}

export interface LeadRecord {
  id: number;
  session_id: string;
  full_name: string;
  email: string;
  mobile: string;
  score: number;
  score_band_id: string;
  score_band_name: string;
  answers_json: string;
  crm_status: string;
  email_status: string;
  whatsapp_status: string;
  sheet_status?: string;
  state?: string;
  created_at: string;
}
