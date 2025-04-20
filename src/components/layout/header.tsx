"use client"

import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import {
  SearchIcon,
  FilterIcon,
  SettingsIcon,
  HelpIcon,
  GridViewIcon,
  ListViewIcon,
  InfoIcon
} from "@/components/icons"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const [view, setView] = useState<"list" | "grid">("list")

  return (
    <header className={cn("flex h-16 items-center justify-between border-b px-4", className)}>
      {/* Search Section */}
      <div className="flex items-center flex-1 max-w-2xl relative">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="search"
            placeholder="Search in Drive"
            className="pl-10 pr-10 py-2 h-10 rounded-full border-0 bg-accent/50 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <FilterIcon className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Toggle view"
            >
              {view === "list" ? (
                <ListViewIcon className="h-5 w-5" />
              ) : (
                <GridViewIcon className="h-5 w-5" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setView("list")}>
              <ListViewIcon className="mr-2 h-4 w-4" />
              <span>List view</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setView("grid")}>
              <GridViewIcon className="mr-2 h-4 w-4" />
              <span>Grid view</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Info"
        >
          <InfoIcon className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Settings"
        >
          <SettingsIcon className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Help"
        >
          <HelpIcon className="h-5 w-5" />
        </Button>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-9 w-9 cursor-pointer">
              <AvatarImage src="https://github.com/shadcn.png" alt="@user" />
              <AvatarFallback>DP</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
