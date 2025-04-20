"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import {
  DriveLogoIcon,
  HomeIcon,
  FolderIcon,
  ShareIcon,
  RecentIcon,
  StarredIcon,
  TrashIcon,
  StorageIcon,
  ConvertIcon,
  SettingsIcon,
  MenuIcon,
  PlusIcon,
  VideoIcon
} from "@/components/icons"
import { CameraIcon as VideoRecorderIcon, HistoryIcon } from "lucide-react"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"

interface SidebarProps {
  className?: string
}

const menuItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: HomeIcon,
  },
  {
    name: "My Drive",
    href: "/drive",
    icon: FolderIcon,
  },
  {
    name: "Convert",
    href: "/convert",
    icon: VideoIcon,
    submenu: [
      {
        name: "Converting",
        href: "/convert/in-progress",
        icon: VideoRecorderIcon,
      },
      {
        name: "Converted",
        href: "/convert/completed",
        icon: HistoryIcon,
      },
    ],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: SettingsIcon,
  },
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Mock storage usage
  const storageUsed = 2.45 // GB
  const storageTotal = 15 // GB
  const storagePercentage = (storageUsed / storageTotal) * 100

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" size="icon" className="ml-2">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <MobileNav storageUsed={storageUsed} storageTotal={storageTotal} />
        </SheetContent>
      </Sheet>
      <div className={cn("hidden lg:block", className)}>
        <DesktopNav pathname={pathname} storageUsed={storageUsed} storageTotal={storageTotal} />
      </div>
    </>
  )
}

function DesktopNav({ pathname, storageUsed, storageTotal }: {
  pathname: string,
  storageUsed: number,
  storageTotal: number
}) {
  const storagePercentage = (storageUsed / storageTotal) * 100

  return (
    <div className="relative flex h-full w-[280px] flex-col bg-background pt-2">
      <div className="flex items-center px-6 py-2">
        <Link href="/" className="flex items-center gap-2">
          <DriveLogoIcon />
          <span className="text-xl font-medium">Drive</span>
        </Link>
      </div>

      {/* New Button */}
      <div className="px-3 py-4">
        <Button className="w-full justify-start gap-2 rounded-full px-6 text-sm shadow-sm">
          <PlusIcon className="h-5 w-5" />
          New
        </Button>
      </div>

      <ScrollArea className="flex-1 pb-12">
        <nav className="grid gap-1 px-3">
          {menuItems.map((item) => {
            const isActive = 
              pathname === item.href || 
              (item.submenu && item.submenu.some(subitem => pathname === subitem.href));
            
            return (
              <div key={item.href} className="space-y-1">
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-accent/50 font-semibold text-foreground" : ""
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-blue-500" : "text-muted-foreground")} />
                  <span>{item.name}</span>
                </Link>
                
                {item.submenu && (
                  <div className="ml-6 space-y-1">
                    {item.submenu.map((subitem) => {
                      const isSubActive = pathname === subitem.href;
                      
                      return (
                        <Link
                          key={subitem.href}
                          href={subitem.href}
                          className={cn(
                            "flex h-10 items-center gap-3 rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                            isSubActive ? "bg-accent/50 font-semibold text-foreground" : ""
                          )}
                        >
                          <subitem.icon className={cn("h-3.5 w-3.5", isSubActive ? "text-blue-500" : "text-muted-foreground")} />
                          <span>{subitem.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Storage section */}
        <div className="mt-6 px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <StorageIcon className="h-4 w-4" />
            <span>Storage</span>
          </div>
          <div className="mt-2">
            <Progress className="h-2" value={storagePercentage} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {storageUsed.toFixed(1)} GB of {storageTotal} GB used
          </p>
          <Button variant="outline" size="sm" className="mt-4 w-full text-xs">
            Get more storage
          </Button>
        </div>
      </ScrollArea>
    </div>
  )
}

function MobileNav({ storageUsed, storageTotal }: {
  storageUsed: number,
  storageTotal: number
}) {
  const pathname = usePathname()
  const storagePercentage = (storageUsed / storageTotal) * 100

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <DriveLogoIcon />
          <span className="text-xl font-medium">Drive</span>
        </Link>
      </div>

      {/* New Button */}
      <div className="px-3 py-4">
        <Button className="w-full justify-start gap-2 rounded-full px-6 text-sm shadow-sm">
          <PlusIcon className="h-5 w-5" />
          New
        </Button>
      </div>

      <ScrollArea className="flex-1 pb-12">
        <nav className="grid gap-1 px-3">
          {menuItems.map((item) => {
            const isActive = 
              pathname === item.href || 
              (item.submenu && item.submenu.some(subitem => pathname === subitem.href));
            
            return (
              <div key={item.href} className="space-y-1">
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-accent/50 font-semibold text-foreground" : ""
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-blue-500" : "text-muted-foreground")} />
                  <span>{item.name}</span>
                </Link>
                
                {item.submenu && (
                  <div className="ml-6 space-y-1">
                    {item.submenu.map((subitem) => {
                      const isSubActive = pathname === subitem.href;
                      
                      return (
                        <Link
                          key={subitem.href}
                          href={subitem.href}
                          className={cn(
                            "flex h-10 items-center gap-3 rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                            isSubActive ? "bg-accent/50 font-semibold text-foreground" : ""
                          )}
                        >
                          <subitem.icon className={cn("h-3.5 w-3.5", isSubActive ? "text-blue-500" : "text-muted-foreground")} />
                          <span>{subitem.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Storage section */}
        <div className="mt-6 px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <StorageIcon className="h-4 w-4" />
            <span>Storage</span>
          </div>
          <div className="mt-2">
            <Progress className="h-2" value={storagePercentage} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {storageUsed.toFixed(1)} GB of {storageTotal} GB used
          </p>
          <Button variant="outline" size="sm" className="mt-4 w-full text-xs">
            Get more storage
          </Button>
        </div>
      </ScrollArea>
    </div>
  )
}
