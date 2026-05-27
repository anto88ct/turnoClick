export type SiteBlockType = 'text' | 'image' | 'video' | 'map' | 'phone-button' | 'spacer' | 'hero' | 'gallery' | 'divider';

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

export type BlockConfig =
  | TextBlockConfig
  | ImageBlockConfig
  | GalleryBlockConfig
  | VideoBlockConfig
  | MapBlockConfig
  | PhoneButtonConfig
  | SpacerBlockConfig
  | HeroBlockConfig
  | DividerBlockConfig;

export interface SiteBlock {
  id: string;
  type: SiteBlockType;
  order: number;
  config: BlockConfig;
  backgroundColor?: string;
  paddingY?: 'none' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export interface SiteHeaderConfig {
  logoText?: string;
  bgColor?: string;
  textColor?: string;
  showQueuePill?: boolean;
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
  /** Show live queue status widget (in-attesa count, wait time) */
  showQueueStatus: boolean;
  /** Allow patients to join the queue from the site */
  allowJoinQueue: boolean;
  /** Allow patients to book appointments from the site (requires login/register) */
  allowBookAppointment: boolean;
  /** Show book-appointment CTA even when not logged in (redirects to login) */
  showBookingCTAPublic: boolean;
  /** Show doctors list section */
  showDoctors: boolean;
  /** Custom booking button label */
  bookingLabel: string;
}
