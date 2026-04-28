export type Service = {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
};

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  initials: string;
  serviceIds: string[];
};

export const SERVICES: Service[] = [
  { id: "1", name: "Haircut & Style",   duration: 45,  price: 65,  description: "Precision cut tailored to your face shape and hair texture." },
  { id: "2", name: "Balayage",          duration: 150, price: 180, description: "Hand-painted highlights for a seamless, natural gradient." },
  { id: "3", name: "Deep Conditioning", duration: 30,  price: 45,  description: "Intensive moisture treatment for all hair types." },
  { id: "4", name: "Blow Dry & Style",  duration: 45,  price: 55,  description: "Professional blowout with lasting volume and hold." },
  { id: "5", name: "Color Touch-Up",    duration: 60,  price: 85,  description: "Root color refresh for a polished, seamless finish." },
  { id: "6", name: "Keratin Treatment", duration: 120, price: 220, description: "Smooth, frizz-free results that last up to five months." },
];

export const STAFF: StaffMember[] = [
  { id: "1", name: "Emma Rose",     role: "Senior Stylist",   initials: "ER", serviceIds: ["1", "3", "4", "6"] },
  { id: "2", name: "Marcus Chen",   role: "Color Specialist", initials: "MC", serviceIds: ["2", "5", "6"] },
  { id: "3", name: "Sofia Laurent", role: "Master Stylist",   initials: "SL", serviceIds: ["1", "2", "3", "4", "5", "6"] },
  { id: "4", name: "Aria Kim",      role: "Texture Expert",   initials: "AK", serviceIds: ["3", "4", "6"] },
];
