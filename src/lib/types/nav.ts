export interface NavItem {
  title: string;
  href: string;
  icon: string;
  isActive?: boolean;
  badge?: string;
  subItems?: NavSubItem[];
}

export interface NavSubItem {
  title: string;
  href: string;
  isActive?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}
