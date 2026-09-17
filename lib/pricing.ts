export interface PricingPlan {
  id: string;
  label: string;
  duration: string;
  price: number;
  originalPrice?: number;
  savings?: number;
  badge?: string;
  description: string;
  isTrial: boolean;
  category: 'consultation' | 'session' | 'package';
  available: boolean;
}

export const PRICING_CONSTANTS = {
  // First Consultation (Introductory assessment)
  firstConsultation: {
    price: 499,
    duration: '15 min',
    label: 'First Consultation',
    description: '1-on-1 assessment & personalized care plan'
  },
  // Individual Standard Psychologist
  individualStandard: {
    price: 1499,
    duration: '50-60 min',
    label: '1 Session',
    description: 'Comprehensive 1-on-1 clinical therapy'
  },
  // Individual Senior Psychologist
  individualSenior: {
    price: 2799,
    duration: '50-60 min',
    label: '1 Session (Senior)',
    description: 'Senior psychologist with 10+ yrs specialized expertise'
  },
  // Couple Standard Psychologist
  coupleStandard: {
    price: 2199,
    duration: '50-60 min',
    label: 'Couple Session',
    description: 'Relationship & couples counseling'
  },
  // Couple Senior Psychologist
  coupleSenior: {
    price: 3499,
    duration: '50-60 min',
    label: 'Senior Couple Session',
    description: 'Couples therapy with senior clinical psychologist'
  },
  // Packages (Based on 1 session = ₹1,499)
  packages: [
    {
      id: 'pack_4',
      label: '4 Sessions Pack',
      duration: '4 × 50 min',
      originalPrice: 5996,
      price: 5499,
      savings: 497,
      badge: 'Save ₹497',
      description: '₹1,375 / session • Ideal for foundational progress'
    },
    {
      id: 'pack_6',
      label: '6 Sessions Pack',
      duration: '6 × 50 min',
      originalPrice: 8994,
      price: 7999,
      savings: 995,
      badge: 'Save ₹995 • Popular',
      description: '₹1,333 / session • Ideal for structured healing'
    },
    {
      id: 'pack_8',
      label: '8 Sessions Pack',
      duration: '8 × 50 min',
      originalPrice: 11992,
      price: 9999,
      savings: 1993,
      badge: 'Save ₹1,993 • Best Value',
      description: '₹1,250 / session • Comprehensive emotional transformation'
    }
  ]
};

export interface ResolvePriceParams {
  planType: string;
  therapyType?: string;
  practitionerLevel?: string;
  isTrial?: boolean;
  therapistPricing?: Record<string, number>;
}

export function calculateSessionAmount(params: ResolvePriceParams): number {
  const { planType, therapyType = 'Individual', practitionerLevel = 'Standard Psychologist', isTrial = false, therapistPricing } = params;

  const isSenior = practitionerLevel === 'Senior Psychologist' || planType.toLowerCase().includes('senior');
  const isCouple = therapyType === 'Couple' || planType.toLowerCase().includes('couple');

  // Custom therapist override checks
  if (therapistPricing && typeof therapistPricing === 'object') {
    if (planType && therapistPricing[planType]) {
      return Number(therapistPricing[planType]);
    }
  }

  // First Consultation
  if (isTrial || planType === 'First Consultation' || planType === 'Trial Session') {
    return PRICING_CONSTANTS.firstConsultation.price;
  }

  // Packages
  if (planType === '4 Sessions Pack' || planType === '4 Sessions') {
    return PRICING_CONSTANTS.packages[0].price;
  }
  if (planType === '6 Sessions Pack' || planType === '6 Sessions') {
    return PRICING_CONSTANTS.packages[1].price;
  }
  if (planType === '8 Sessions Pack' || planType === '8 Sessions') {
    return PRICING_CONSTANTS.packages[2].price;
  }

  // Couple Session
  if (isCouple || planType === 'Couple Session' || planType === 'Senior Couple Session') {
    return isSenior ? PRICING_CONSTANTS.coupleSenior.price : PRICING_CONSTANTS.coupleStandard.price;
  }

  // Standard Individual
  return isSenior ? PRICING_CONSTANTS.individualSenior.price : PRICING_CONSTANTS.individualStandard.price;
}

export function getPlansForDisplay(options: {
  therapyType: string;
  practitionerLevel: string;
  isTrialAvailable: boolean;
}): PricingPlan[] {
  const { therapyType, practitionerLevel, isTrialAvailable } = options;
  const isSenior = practitionerLevel === 'Senior Psychologist';
  const isCouple = therapyType === 'Couple';

  const plans: PricingPlan[] = [];

  // 1. First Consultation (15 min)
  plans.push({
    id: 'first_consultation',
    label: 'First Consultation',
    duration: PRICING_CONSTANTS.firstConsultation.duration,
    price: PRICING_CONSTANTS.firstConsultation.price,
    description: PRICING_CONSTANTS.firstConsultation.description,
    badge: '15 MIN INTRO',
    isTrial: true,
    category: 'consultation',
    available: isTrialAvailable
  });

  // 2. Single Session (50-60 min)
  if (isCouple) {
    plans.push({
      id: isSenior ? 'couple_senior' : 'couple_standard',
      label: isSenior ? 'Senior Couple Session' : 'Couple Session',
      duration: isSenior ? PRICING_CONSTANTS.coupleSenior.duration : PRICING_CONSTANTS.coupleStandard.duration,
      price: isSenior ? PRICING_CONSTANTS.coupleSenior.price : PRICING_CONSTANTS.coupleStandard.price,
      description: isSenior ? PRICING_CONSTANTS.coupleSenior.description : PRICING_CONSTANTS.coupleStandard.description,
      badge: isSenior ? '50-60 MIN • SENIOR' : '50-60 MIN',
      isTrial: false,
      category: 'session',
      available: true
    });
  } else {
    plans.push({
      id: isSenior ? 'individual_senior' : 'individual_standard',
      label: isSenior ? 'Senior Psychologist Session' : '1 Session',
      duration: isSenior ? PRICING_CONSTANTS.individualSenior.duration : PRICING_CONSTANTS.individualStandard.duration,
      price: isSenior ? PRICING_CONSTANTS.individualSenior.price : PRICING_CONSTANTS.individualStandard.price,
      description: isSenior ? PRICING_CONSTANTS.individualSenior.description : PRICING_CONSTANTS.individualStandard.description,
      badge: isSenior ? '50-60 MIN • SENIOR' : '50-60 MIN',
      isTrial: false,
      category: 'session',
      available: true
    });
  }

  // 3. Packages (4, 6, 8 Sessions)
  PRICING_CONSTANTS.packages.forEach((pkg) => {
    plans.push({
      id: pkg.id,
      label: pkg.label,
      duration: pkg.duration,
      price: pkg.price,
      originalPrice: pkg.originalPrice,
      savings: pkg.savings,
      badge: pkg.badge,
      description: pkg.description,
      isTrial: false,
      category: 'package',
      available: true
    });
  });

  return plans;
}
