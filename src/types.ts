export type ProductType = 
  | 'business_card' 
  | 'flyer' 
  | 'poster' 
  | 'backlit_poster' 
  | 'rollup_banner' 
  | 'neon_poster' 
  | 'wallpaper_airtex' 
  | 'wall_circle_gekkotex' 
  | 'spandoek' 
  | 'dranghek_banner' 
  | 'hekwerk_banner'
  | 'brochures'
  | 'folders'
  | 'fleecedekens'
  | 'foto_canvas'
  | 'handdoeken'
  | 'mokken'
  | 'vlaggen'
  | 'kleding';

export interface ProductAttributeOption {
  id: string;
  name: string;
  description?: string;
  surcharge?: number;
}

export interface ProductAttributes {
  size: ProductAttributeOption[];
  paperType: ProductAttributeOption[];
  printing: ProductAttributeOption[];
  finishing: ProductAttributeOption[];
  quantity: ProductAttributeOption[];
}

export interface SelectedConfiguration {
  size: string;
  paperType: string;
  printing: string;
  finishing: string;
  quantity: string;
  width?: string;
  height?: string;
}

export interface ConfiguratorStateResponse {
  valid: boolean;
  attributes: ProductAttributes;
  selected: SelectedConfiguration;
  notices: {
    type: 'info' | 'warning' | 'error';
    message: string;
  }[];
}

export interface PricingRequest {
  productType: ProductType;
  configuration: SelectedConfiguration;
  isExpress: boolean;
}

export interface PriceBreakdownItem {
  label: string;
  value: number;
}

export interface PricingResponse {
  valid: boolean;
  error?: string;
  prices: {
    net: number;
    vat: number;
    gross: number;
    savings?: number;
    isExpress: boolean;
  };
  delivery: {
    estimatedDate: string; // Formatting: "Woensdag 10 juni"
    workingDays: number;
    urgencyText: string;
  };
  breakdown: PriceBreakdownItem[];
}

export interface CartItem {
  id: string;
  productType: ProductType;
  productName: string;
  configuration: SelectedConfiguration;
  configurationLabels: {
    size: string;
    paperType: string;
    printing: string;
    finishing: string;
    quantity: string;
  };
  price: number;
  deliveryDate: string;
  isExpress: boolean;
  fileUrl?: string;
  fileName?: string;
  addedAt: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  companyName?: string;
  email: string;
  phone: string;
  street: string;
  houseNumber: string;
  houseAddition?: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface Order {
  id: string;
  userId?: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  billingAddressSame: boolean;
  billingAddress?: ShippingAddress;
  pricing: {
    net: number;
    vat: number;
    gross: number;
  };
  paymentMethod: 'ideal' | 'bancontact' | 'creditcard' | 'paypal';
  paymentDetails?: {
    bankName?: string;
    cardNumberMask?: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
}
