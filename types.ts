
export interface AnalysisResult {
  terminals: number[];
  dozens: number[]; // Sugestão das 2 Dúzias mais fortes
  confidence: number;
  action: 'BET' | 'WAIT' | 'ERROR';
  reasoning: string;
  detectedHistory: number[];
}

export interface BetHistory {
  id: string;
  timestamp: number;
  result: AnalysisResult;
  imageUrl?: string;
}

export enum GameStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
