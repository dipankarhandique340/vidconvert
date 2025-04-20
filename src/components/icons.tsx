import {
  Folder,
  FileCog,
  Settings,
  Menu,
  FileVideo,
  HardDriveDownload,
  UploadCloud,
  Download,
  RotateCw,
  Layers,
  Play,
  AlertCircle,
  Check,
  Search,
  Home,
  Clock,
  Star,
  Trash2,
  Database,
  ChevronDown,
  Filter,
  Users,
  Calendar,
  Share2,
  Plus,
  Grid,
  ListFilter,
  Info,
  HelpCircle
} from "lucide-react"

export const FolderIcon = Folder
export const ConvertIcon = FileCog
export const SettingsIcon = Settings
export const MenuIcon = Menu
export const VideoIcon = FileVideo
export const DownloadIcon = HardDriveDownload
export const UploadIcon = UploadCloud
export const SaveIcon = Download
export const ConvertingIcon = RotateCw
export const LayersIcon = Layers
export const PlayIcon = Play
export const WarningIcon = AlertCircle
export const SuccessIcon = Check
export const SearchIcon = Search
export const HomeIcon = Home
export const RecentIcon = Clock
export const StarredIcon = Star
export const TrashIcon = Trash2
export const StorageIcon = Database
export const ChevronDownIcon = ChevronDown
export const FilterIcon = Filter
export const UsersIcon = Users
export const ModifiedIcon = Calendar
export const ShareIcon = Share2
export const PlusIcon = Plus
export const GridViewIcon = Grid
export const ListViewIcon = ListFilter
export const InfoIcon = Info
export const HelpIcon = HelpCircle

// Google Drive Logo
export const DriveLogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 87.3 78"
    height="24"
    width="24"
    {...props}
  >
    <path
      d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z"
      fill="#0066da"
    />
    <path
      d="M43.65 25L29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0-1.2 4.5h27.45l16.2-28z"
      fill="#00ac47"
    />
    <path
      d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.5L73.55 76.8z"
      fill="#ea4335"
    />
    <path
      d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.85 0H34.45c-1.65 0-3.2.4-4.55 1.2L43.65 25z"
      fill="#00832d"
    />
    <path
      d="M59.5 53H27.45L13.7 76.8c1.35.8 2.9 1.2 4.55 1.2h50.4c1.65 0 3.2-.4 4.55-1.2L59.5 53z"
      fill="#2684fc"
    />
    <path
      d="M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 59.85 53h27.45c0-1.55-.4-3.1-1.2-4.5l-12.7-22z"
      fill="#ffba00"
    />
  </svg>
)
