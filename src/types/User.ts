export type UserPersona = 'early_career' | 'variable_incentive' | 'freelancer' | 'family_dependent' | 'custom';

export interface User {
  id: string;
  name: string;
  email?: string;
  persona: UserPersona;
  targetSegment: string;
  createdAt: string;
  updatedAt: string;
}

