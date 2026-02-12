/**
 * Phosphor Icons Configuration
 * 
 * This file provides a centralized configuration for Phosphor Icons used throughout the application.
 * Phosphor Icons are thin, rounded icons that align with the Visual Design System.
 * 
 * Usage:
 * import { HomeIcon, UserIcon } from '@/utils/icons';
 * <HomeIcon size={24} weight="regular" />
 * 
 * Icon weights: thin, light, regular, bold, fill, duotone
 * Default weight: regular (thin, rounded style)
 */

// Import commonly used icons from phosphor-react
export {
  // Navigation
  House as HomeIcon,
  ShoppingCart as OrderIcon,
  Users as EmployeeIcon,
  Package as ProductIcon,
  ForkKnife as MenuIcon,
  CookingPot as RecipeIcon,
  Truck as SupplierIcon,
  FileText as ReportIcon,
  CurrencyDollar as FinanceIcon,
  ClockClockwise as AttendanceIcon,
  Gear as SettingsIcon,
  
  // Actions
  Plus as PlusIcon,
  Minus as MinusIcon,
  Pencil as EditIcon,
  Trash as DeleteIcon,
  Eye as ViewIcon,
  EyeSlash as HideIcon,
  MagnifyingGlass as SearchIcon,
  Funnel as FilterIcon,
  ArrowsClockwise as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  X as CloseIcon,
  Check as CheckIcon,
  
  // UI Elements
  CaretDown as ExpandIcon,
  CaretUp as CollapseIcon,
  CaretRight as ChevronRightIcon,
  CaretLeft as ChevronLeftIcon,
  DotsThree as MoreIcon,
  List as ListIcon,
  GridFour as GridIcon,
  
  // Status
  CheckCircle as SuccessIcon,
  WarningCircle as WarningIcon,
  XCircle as ErrorIcon,
  Info as InfoIcon,
  Bell as NotificationIcon,
  
  // User
  User as UserProfileIcon,
  SignOut as LogoutIcon,
  SignIn as LoginIcon,
  UserCircle as AvatarIcon,
  
  // Product/Inventory
  Coffee as CoffeeIcon,
  Barcode as BarcodeIcon,
  Tag as TagIcon,
  Cube as BoxIcon,
  
  // Payment
  QrCode as QRCodeIcon,
  CreditCard as CardIcon,
  Money as CashIcon,
  Bank as BankIcon,
  Wallet as PaymentIcon,
  
  // Charts/Analytics
  ChartLine as ChartIcon,
  TrendUp as TrendUpIcon,
  TrendDown as TrendDownIcon,
  ChartBar as BarChartIcon,
  
  // File/Document
  FilePdf as PDFIcon,
  FileXls as ExcelIcon,
  FileCsv as CSVIcon,
  File as FileIcon,
  Folder as FolderIcon,
  
  // Communication
  Envelope as EmailIcon,
  Phone as PhoneIcon,
  MapPin as LocationIcon,
  
  // Time
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Timer as TimerIcon,
  
  // Misc
  Star as StarIcon,
  Heart as HeartIcon,
  Share as ShareIcon,
  Printer as PrintIcon,
  Image as ImageIcon,
} from 'phosphor-react';

/**
 * Default icon props for consistent styling
 */
export const defaultIconProps = {
  size: 24,
  weight: 'regular', // Thin, rounded style
};

/**
 * Icon size presets
 */
export const iconSizes = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

/**
 * Helper function to get icon with default props
 */
export const getIconProps = (size = 'md', weight = 'regular') => ({
  size: typeof size === 'number' ? size : iconSizes[size],
  weight,
});
