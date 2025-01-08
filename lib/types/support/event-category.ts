export type EventCategory = {
  id: string;
  name: string;
  emoji: string | null;
  color: number;
  updatedAt: Date;
  createdAt: Date;
  uniqueFieldCount: number;
  eventsCount: number;
  lastPing: Date | null;
};

export type SidebarCategory = {
  category: string;
  items: SidebarItem[];
};

export type SidebarItem = {
  href: string;
  text: string;
};
