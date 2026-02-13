
export interface AnalysisResult {
  terminals: number[];
  confidence: number;
  action: 'BET' | 'WAIT';
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
