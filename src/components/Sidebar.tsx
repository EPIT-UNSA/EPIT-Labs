/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Home, 
  BookOpen, 
  Mail, 
  ChevronRight, 
  ChevronDown, 
  EyeOff, 
  Menu, 
  X, 
  Search,
  Sliders,
  Sparkles,
  Sun,
  Moon,
  RotateCcw
} from "lucide-react";
import { EpitData, Lab } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface SidebarProps {
  data: EpitData;
  currentPath: string;
  isEditMode: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onNavigate: (path: string) => void;
  themeMode: "light" | "dark";
  onThemeModeChange: (mode: "light" | "dark") => void;
  themeColor: string;
  onThemeColorChange: (color: string) => void;
  onResetThemeColor: () => void;
}

export default function Sidebar({ 
  data, 
  currentPath, 
  isEditMode, 
  isMobileOpen, 
  onCloseMobile, 
  onNavigate,
  themeMode,
  onThemeModeChange,
  themeColor,
  onThemeColorChange,
  onResetThemeColor
}: SidebarProps) {
  // Track collapsed nodes in local state or preserve across renders
  const [expandedNodes, setExpandedNodes] = React.useState<Record<string, boolean>>({
    // Expand first lab by default
    "SL01LA101": true,
  });

  // Local state for sidebar filtering
  const [sidebarSearch, setSidebarSearch] = React.useState("");

  const toggleNode = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering navigation
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Filter laboratories based on search and visibility
  const filteredLabs = React.useMemo(() => {
    return (data.labs || []).filter(lab => {
      const isVisible = isEditMode || lab.visible !== false;
      const matchesSearch = lab.infoAmbiente?.["NOMBRE DEL LABORATORIO O TALLER"]
        ?.toLowerCase()
        .includes(sidebarSearch.toLowerCase()) || 
        lab.infoAmbiente?.["CÓDIGO DE LABORATORIO O TALLER"]
        ?.toLowerCase()
        .includes(sidebarSearch.toLowerCase());
      
      return isVisible && matchesSearch;
    });
  }, [data.labs, isEditMode, sidebarSearch]);

  const isActive = (path: string) => currentPath === path;
  
  // Custom navigation that closes mobile drawer
  const handleNav = (path: string) => {
    onNavigate(path);
    onCloseMobile();
  };

  const renderContent = () => (
    <div className="flex flex-col h-full bg-theme-card text-theme-text-primary font-sans border-r border-theme-border-medium shadow-sm transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-6 border-b border-theme-border-light flex items-center justify-between transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-theme-brand flex items-center justify-center font-display font-extrabold text-white text-xl tracking-wider shadow-md transition-colors duration-200">
            U
          </div>
          <div>
            <h1 className="text-xs font-bold text-theme-text-tertiary tracking-widest uppercase">EPIT Labs</h1>
            <p className="text-sm font-bold text-theme-text-primary">UNSA Wiki</p>
          </div>
        </div>
        {/* Mobile close button */}
        <button 
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-theme-text-tertiary hover:text-theme-text-primary hover:bg-theme-hover transition-colors duration-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar Search */}
      <div className="p-4 border-b border-theme-border-light bg-theme-page/30 transition-colors duration-200">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-theme-text-tertiary" />
          <input
            type="text"
            className="w-full bg-theme-card border border-theme-border-medium rounded-lg pl-9 pr-3 py-1.5 text-xs text-theme-text-primary placeholder-theme-text-tertiary focus:outline-none focus:border-theme-brand focus:ring-1 focus:ring-theme-brand transition-all duration-200"
            placeholder="Filtrar mapa del sitio..."
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Navigation Tree Menu */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Core Links */}
        <div className="space-y-1">
          <button
            onClick={() => handleNav("/")}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer ${
              isActive("/") 
                ? "bg-theme-hover text-theme-text-primary font-semibold" 
                : "text-theme-text-secondary hover:bg-theme-hover hover:text-theme-text-primary"
            }`}
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            <span>Inicio</span>
          </button>
        </div>

        {/* Tree Laboratories Section */}
        <div className="space-y-2">
          <p className="px-3 text-[10px] font-bold text-theme-text-tertiary uppercase tracking-widest mb-2">Laboratorios</p>
          
          <div className="space-y-1">
            {filteredLabs.map((lab, idx) => {
              const code = lab.infoAmbiente?.["CÓDIGO DE LABORATORIO O TALLER"] || "";
              const name = lab.infoAmbiente?.["NOMBRE DEL LABORATORIO O TALLER"] || "";
              const shortName = name?.replace("LABORATORIO DE ", "")?.replace("TALLER DE ", "");
              
              const isExpanded = !!expandedNodes[code];
              const isLabActive = currentPath.startsWith(`/lab/${code}`);
              
              const programAbbrev = lab.infoAmbiente?.["PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER"]?.[0]?.split(" ")?.pop() || "P13";

              return (
                <div 
                  key={code} 
                  className={`flex flex-col ${lab.visible === false ? "opacity-50" : ""}`}
                >
                  {/* Parent Tree Node */}
                  <div
                    onClick={() => handleNav(`/lab/${code}/info`)}
                    className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors duration-200 ${
                      isLabActive && currentPath.endsWith("/info")
                        ? "bg-theme-hover text-theme-text-primary"
                        : "text-theme-text-muted hover:bg-theme-hover hover:text-theme-text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div 
                        onClick={(e) => toggleNode(code, e)}
                        className="p-1 rounded hover:bg-theme-active/50 text-theme-text-tertiary transition-colors duration-200"
                        title={isExpanded ? "Contraer" : "Expandir"}
                      >
                        <ChevronRight className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${isExpanded ? "transform rotate-90 text-theme-text-secondary" : ""}`} />
                      </div>
                      <span className="text-sm font-semibold truncate">
                        {code}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-[10px] bg-theme-active text-theme-text-primary px-1.5 py-0.5 rounded uppercase font-bold tracking-tight">
                        {programAbbrev}
                      </span>
                      {lab.visible === false && (
                        <span title="Oculto para el público" className="text-[9px] bg-theme-active text-theme-text-secondary px-1 rounded uppercase">
                          Oculto
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nested Sub-nodes */}
                  {isExpanded && (
                    <div className="ml-6 mt-1 border-l border-theme-border-medium pl-2 space-y-1">
                      {/* Info sub-node */}
                      <button
                        onClick={() => handleNav(`/lab/${code}/info`)}
                        className={`w-full text-left px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 cursor-pointer ${
                          isActive(`/lab/${code}/info`)
                            ? "text-theme-brand font-medium bg-theme-brand-light"
                            : "text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-hover"
                        }`}
                      >
                        Información General
                      </button>

                      {/* Equipos sub-node */}
                      {(isEditMode || (lab.equipos && lab.equipos.filter(e => e.visible !== false).length > 0)) && (
                        <button
                          onClick={() => handleNav(`/lab/${code}/equipos`)}
                          className={`w-full text-left px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 cursor-pointer ${
                            isActive(`/lab/${code}/equipos`)
                              ? "text-theme-brand font-medium bg-theme-brand-light"
                              : "text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-hover"
                          }`}
                        >
                          Equipos Técnicos
                        </button>
                      )}

                      {/* Software sub-node */}
                      {(isEditMode || (lab.software && lab.software.filter(s => s.visible !== false).length > 0)) && (
                        <button
                          onClick={() => handleNav(`/lab/${code}/software`)}
                          className={`w-full text-left px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 cursor-pointer ${
                            isActive(`/lab/${code}/software`)
                              ? "text-theme-brand font-medium bg-theme-brand-light"
                              : "text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-hover"
                          }`}
                        >
                          Software & Licencias
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredLabs.length === 0 && (
              <div className="text-center py-4 text-theme-text-tertiary text-xs">
                Ningún ambiente encontrado.
              </div>
            )}
          </div>
        </div>

        {/* Theme Settings Section */}
        <div className="pt-4 border-t border-theme-border-light space-y-3 transition-colors duration-200">
          <p className="px-3 text-[10px] font-bold text-theme-text-tertiary uppercase tracking-widest flex items-center gap-1.5">
            <Sliders className="w-3 h-3 text-theme-text-muted" /> Personalizar Tema
          </p>
          
          <div className="px-3 space-y-3">
            {/* Mode Select Buttons */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-theme-page rounded-lg border border-theme-border-light transition-colors duration-200">
              <button
                onClick={() => onThemeModeChange("light")}
                className={`flex items-center justify-center gap-1.5 py-1 px-2 text-xs font-semibold rounded-md transition duration-200 cursor-pointer ${
                  themeMode === "light"
                    ? "bg-theme-card text-theme-text-primary shadow-sm"
                    : "text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-hover/50"
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Claro</span>
              </button>
              <button
                onClick={() => onThemeModeChange("dark")}
                className={`flex items-center justify-center gap-1.5 py-1 px-2 text-xs font-semibold rounded-md transition duration-200 cursor-pointer ${
                  themeMode === "dark"
                    ? "bg-theme-card text-theme-text-primary shadow-sm"
                    : "text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-hover/50"
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Oscuro</span>
              </button>
            </div>

            {/* Custom Color Selector */}
            <div className="flex items-center justify-between gap-2 p-1.5 bg-theme-page/50 rounded-lg border border-theme-border-light transition-colors duration-200">
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative w-6 h-6 rounded-md border border-theme-border-medium shadow-inner flex-shrink-0 cursor-pointer overflow-hidden group">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => onThemeColorChange(e.target.value)}
                    className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer border-0 p-0"
                  />
                  <div 
                    className="absolute inset-0 pointer-events-none rounded border-2 border-white/20"
                    style={{ backgroundColor: themeColor }}
                  />
                </div>
                <div className="truncate">
                  <p className="text-[10px] font-bold text-theme-text-secondary leading-tight">Color personalizado</p>
                  <p className="text-[9px] text-theme-text-muted font-mono leading-none uppercase">{themeColor}</p>
                </div>
              </div>

              {themeColor !== "#00a7d1" && (
                <button
                  onClick={onResetThemeColor}
                  className="p-1 rounded text-theme-text-muted hover:text-theme-brand hover:bg-theme-hover transition cursor-pointer"
                  title="Restablecer color UNSA"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer info inside sidebar */}
        <div className="pt-4 border-t border-theme-border-light space-y-2 transition-colors duration-200">
          {data.contacto?.visible !== false && data.contacto?.enlaces && (
            <p className="px-3 text-[10px] font-bold text-theme-text-tertiary uppercase tracking-widest mb-2">Enlaces Institucionales</p>
          )}
          
          <div className="space-y-0.5">
            {data.contacto?.enlaces?.slice(0, 6).map((link, idx) => (
              <a
                key={idx}
                href={link.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-hover transition-colors duration-200"
              >
                <BookOpen className="w-3.5 h-3.5 flex-shrink-0 text-theme-text-tertiary" />
                <span className="truncate font-medium">{link.titulo || ""}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Active Banner */}
      {isEditMode && (
        <div className="p-4 bg-slate-900 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Mode</span>
            <div className="w-8 h-4 bg-blue-500 rounded-full flex items-center px-0.5">
              <div className="w-3 h-3 bg-white rounded-full ml-auto shadow-sm"></div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight italic">Visualizando elementos con "visible": false</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:block w-80 h-screen sticky top-0 flex-shrink-0 z-10">
        {renderContent()}
      </aside>

      {/* Mobile Sidebar (Slide Over Drawer) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="md:hidden fixed inset-0 bg-black z-40"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed inset-y-0 left-0 w-80 max-w-[85vw] h-full z-50 shadow-2xl"
            >
              {renderContent()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
