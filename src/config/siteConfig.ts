// ============================================================
// SITE CONFIG - Abarrotes Profit
// ============================================================

export interface SiteConfig {
  firmName: string;
  firmSlogan: string;
  firmDescription: string;
  founderName: string;
  founderTitle?: string;
  founderBio?: string;
  yearsExperience?: number;
  contact: {
    phone: string;
    phoneDisplay: string;
    whatsappNumber?: string;
    email: string;
    address: string;
    city: string;
    country: string;
    googleMapsEmbedUrl: string;
    officeHours: string;
  };
  social: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
    linkedin?: string;
    twitter?: string;
    x?: string;
    youtube?: string;
  };
  navigation: {
    items: Array<{
      label: string;
      href: string;
      children?: Array<{
        label: string;
        href: string;
      }>;
    }>;
  };
  seo: {
    siteTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    locale: string;
  };
  legal: {
    privacyLastUpdated: string;
    termsLastUpdated: string;
  };
  team: Array<{
    name: string;
    title: string;
    bio: string;
    specialties: string[];
    imageUrl?: string;
    bookingSlug?: string;
  }>;
  testimonials: Array<{
    name: string;
    rating: number;
    text: string;
    quote?: string;
    role: string;
    caseType?: string;
  }>;
  values: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  services: Array<{
    id: string;
    title: string;
    description: string;
    shortDescription?: string;
    fullDescription?: string;
    icon: string;
    slug: string;
  }>;
  tabs: Array<{
    title: string;
    content: string;
  }>;
  about: {
    title: string;
    description: string;
    image?: string;
  };
  hero: {
    title: string;
    subtitle: string;
    headline?: string;
    subheadline?: string;
    ctaText: string;
    ctaHref: string;
    image?: string;
  };
}

export const siteConfig: SiteConfig = {
  firmName: 'Tu Súper Tienda',
  firmSlogan: 'Tu Negocio, Tu Control',
  firmDescription: 'Sistema de control de ventas y ganancias inteligente.',
  founderName: '',
  founderTitle: '',
  founderBio: '',
  yearsExperience: 0,

  contact: {
    phone: '',
    phoneDisplay: '',
    whatsappNumber: '573127342068',
    email: 'contacto@supertienda.com',
    address: '',
    city: '',
    country: 'Colombia',
    googleMapsEmbedUrl: '',
    officeHours: 'Lunes a Domingo',
  },
  social: {
    facebook: '',
    instagram: '',
    whatsapp: '',
    linkedin: '',
    twitter: '',
    x: '',
    youtube: '',
  },
  navigation: {
    items: [],
  },

  seo: {
    siteTitle: 'Tu Súper Tienda | Control de Ventas',
    titleTemplate: '%s | Tu Súper Tienda',
    defaultDescription: 'Control total de ventas y ganancias nítidas para tu negocio.',
    locale: 'es_CO',
  },

  legal: {
    privacyLastUpdated: '2026-02-14',
    termsLastUpdated: '2026-02-14',
  },
  team: [],
  testimonials: [],
  values: [],
  services: [],
  tabs: [],
  about: {
    title: '',
    description: '',
  },
  hero: {
    title: '',
    subtitle: '',
    headline: '',
    subheadline: '',
    ctaText: '',
    ctaHref: '',
  },
};
