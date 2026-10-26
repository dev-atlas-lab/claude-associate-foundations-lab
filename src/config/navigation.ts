import {
  BookOpen,
  BookmarkCheck,
  ChartNoAxesColumnIncreasing,
  LayoutDashboard,
  ListChecks,
  Search,
  Settings2,
  Timer,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

export type NavGroup = {
  heading: string;
  items: NavItem[];
};

export const navigation: NavGroup[] = [
  {
    heading: "Workspace",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/learn", label: "Learn", icon: BookOpen },
    ],
  },
  {
    heading: "Assess",
    items: [
      { to: "/practice", label: "Practice", icon: ListChecks },
      { to: "/mock-exam", label: "Mock exam", icon: Timer },
      { to: "/review", label: "Review", icon: BookmarkCheck },
    ],
  },
  {
    heading: "Insights",
    items: [
      { to: "/progress", label: "Progress", icon: ChartNoAxesColumnIncreasing },
      { to: "/glossary", label: "Glossary", icon: Search },
      { to: "/settings", label: "Settings", icon: Settings2 },
    ],
  },
];

const flatNavigation = navigation.flatMap((group) => group.items);

/** Longest-prefix match so /learn/context-window still highlights "Learn". */
export function findNavItem(pathname: string): NavItem | undefined {
  return [...flatNavigation]
    .filter((item) => (item.end ? pathname === item.to : pathname.startsWith(item.to)))
    .sort((a, b) => b.to.length - a.to.length)[0];
}
