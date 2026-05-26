export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  photoUrl: string;
  description: string;
  avgVisitMinutes: number;
  rating: number;
  reviewCount: number;
  available: boolean;
  studioId: string;
}

export interface DoctorTimeSlot {
  time: string;
  available: boolean;
}
