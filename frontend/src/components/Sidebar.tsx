"use client";

import React, { useEffect } from "react";
import {
  LayoutDashboard,
  Sparkles,
  Database,
  MessageSquare,
  Users,
  Megaphone,
  UserPlus,
  MessageCircle,
  PhoneCall,
  Table,
  Radio,
  Building2,
  ChevronRight,
  TrendingUp,
  X,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  leadsCount?: number;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  leadsCount = 0,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const mainNav = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "generate-leads", label: "Generate Leads", icon: Sparkles },
    {
      id: "manage-leads",
      label: "Manage Leads",
      icon: Database,
      badge: leadsCount > 0 ? `${leadsCount}` : undefined,
    },
    { id: "engage-leads", label: "Engage Leads", icon: MessageSquare },
  ];

  const controlCenterNav = [
    { id: "team-members", label: "Team Members", icon: Users },
    {
      id: "lead-sources",
      label: "Lead Sources",
      icon: Megaphone,
      highlight: true,
    },
    { id: "ad-accounts", label: "Ad Accounts", icon: UserPlus },
    { id: "whatsapp", label: "WhatsApp Account", icon: MessageCircle },
    { id: "tele-calling", label: "Tele Calling", icon: PhoneCall },
    { id: "crm-fields", label: "CRM Fields", icon: Table },
    { id: "api-center", label: "API Center", icon: Radio },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  // Close mobile sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen && onMobileClose) {
        onMobileClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen, onMobileClose]);

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div className="p-4 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 py-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white shadow-sm shrink-0">
              <TrendingUp className="w-5 h-5 text-white transform -rotate-45" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              DataWeave
            </span>
          </div>

          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Workspace Profile Card */}
        <div className="mb-6 p-2.5 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors flex items-center justify-between cursor-pointer bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 via-emerald-600 to-slate-800 flex items-center justify-center text-white font-semibold text-xs shadow-inner shrink-0">
              VK
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 leading-tight">
                VK Test
              </div>
              <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                OWNER
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Navigation - MAIN */}
        <div className="mb-6">
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            MAIN
          </div>
          <div className="space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${isActive
                      ? "bg-[#e6f4f1] text-[#0f5c53] font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-[#0f5c53]" : "text-slate-500"
                        }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${isActive
                          ? "bg-[#0f5c53] text-white"
                          : "bg-slate-200 text-slate-700"
                        }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation - CONTROL CENTER */}
        <div className="mb-4">
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            CONTROL CENTER
          </div>
          <div className="space-y-1">
            {controlCenterNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${isActive
                      ? "bg-[#e6f4f1] text-[#0f5c53] font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-[#0f5c53]" : "text-slate-500"
                        }`}
                    />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={() => handleNavClick("business-center")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
        >
          <Building2 className="w-4 h-4 text-slate-500" />
          <span>Business Center</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile/tablet screens < md) */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200/80 flex-col shrink-0 h-screen sticky top-0 select-none">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay Drawer (< md) with backdrop dismiss */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-slate-900/50 backdrop-blur-xs flex animate-in fade-in duration-200"
          onClick={onMobileClose}
        >
          <div
            className="w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
