export type SiteBlockType = 'text' | 'image' | 'video' | 'map' | 'phone-button' | 'spacer' | 'hero' | 'gallery' | 'divider' | 'columns';

export interface BaseBlockConfig {
  [key: string]: any;
}

export interface TextBlockConfig extends BaseBlockConfig {
  content: string;
  align: 'left' | 'center' | 'right';
  fontSize: 'small' | 'normal' | 'large' | 'xlarge';
  color: string;
}

export interface ImageBlockConfig extends BaseBlockConfig {
  url: string;
  alt: string;
  caption?: string;
  width: 'full' | 'large' | 'medium' | 'small';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export interface GalleryBlockConfig extends BaseBlockConfig {
  images: { url: string; alt: string; caption?: string }[];
  columns: 2 | 3 | 4;
  borderRadius: 'none' | 'md' | 'lg';
}

export interface VideoBlockConfig extends BaseBlockConfig {
  url: string;
  aspectRatio: '16:9' | '4:3' | '1:1';
}

export interface MapBlockConfig extends BaseBlockConfig {
  address: string;
  embedUrl: string;
  height: number;
}

export interface PhoneButtonConfig extends BaseBlockConfig {
  phoneNumber: string;
  label: string;
  color: 'primary' | 'secondary' | 'success' | 'outline';
  icon: boolean;
  size: 'sm' | 'md' | 'lg';
  align: 'left' | 'center' | 'right' | 'full';
}

export interface SpacerBlockConfig extends BaseBlockConfig {
  height: number;
}

export interface HeroBlockConfig extends BaseBlockConfig {
  title: string;
  subtitle: string;
  imageUrl: string;
  overlayOpacity: number;
  buttonLabel?: string;
  buttonLink?: string;
  minHeight: number;
  textAlign: 'left' | 'center' | 'right';
}

export interface DividerBlockConfig extends BaseBlockConfig {
  style: 'solid' | 'dashed' | 'dotted' | 'double';
  color: string;
  thickness: number;
}

/** Layout a due colonne: immagine affiancata a testo formattato */
export interface ColumnsBlockConfig extends BaseBlockConfig {
  layout: 'image-left' | 'image-right';
  imageUrl: string;
  imageAlt: string;
  content: string;
  imageRounded: 'none' | 'md' | 'lg' | 'full';
  verticalAlign: 'top' | 'center';
  imageWidthPercent: 40 | 50 | 60;
}

export type BlockConfig =
  | TextBlockConfig
  | ImageBlockConfig
  | GalleryBlockConfig
  | VideoBlockConfig
  | MapBlockConfig
  | PhoneButtonConfig
  | SpacerBlockConfig
  | HeroBlockConfig
  | DividerBlockConfig
  | ColumnsBlockConfig;

export interface SiteBlock {
  id: string;
  type: SiteBlockType;
  order: number;
  config: BlockConfig;
  backgroundColor?: string;
  paddingY?: 'none' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export interface SiteMenuItemConfig {
  label: string;
  href: string;
}

export interface SiteHeaderConfig {
  logoText?: string;
  logoUrl?: string;
  bgColor?: string;
  textColor?: string;
  showQueuePill?: boolean;
  menuItems?: SiteMenuItemConfig[];
  ctaLabel?: string;
  ctaLink?: string;
}

export interface SiteFooterConfig {
  address?: string;
  email?: string;
  phone?: string;
  vatNumber?: string;
  hours?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  bgColor?: string;
  textColor?: string;
}

export interface SitePageConfig {
  blocks: SiteBlock[];
  theme: {
    primaryColor: string;
    fontFamily: string;
    pageBackgroundColor?: string;
  };
}

/** Controls what patients can see/do on the public landing page */
export interface PublicViewConfig {
  showQueueStatus: boolean;
  allowJoinQueue: boolean;
  allowBookAppointment: boolean;
  showBookingCTAPublic: boolean;
  showDoctors: boolean;
  bookingLabel: string;
}
