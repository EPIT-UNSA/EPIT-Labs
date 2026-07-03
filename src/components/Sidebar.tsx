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
  Sparkles
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
}

export default function Sidebar({ 
  data, 
  currentPath, 
  isEditMode, 
  isMobileOpen, 
  onCloseMobile, 
  onNavigate 
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
    <div className="flex flex-col h-full bg-white text-slate-800 font-sans border-r border-slate-200 shadow-sm">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-red-700 flex items-center justify-center font-display font-extrabold text-white text-xl tracking-wider shadow-md">
            U
          </div>
          <div>
            <h1 className="text-xs font-bold text-slate-400 tracking-widest uppercase">EPIT Labs</h1>
            <p className="text-sm font-bold text-slate-800">UNSA Wiki</p>
          </div>
        </div>
        {/* Mobile close button */}
        <button 
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar Search */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/30">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
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
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition cursor-pointer ${
              isActive("/") 
                ? "bg-slate-100 text-slate-900 font-semibold" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            <span>Inicio</span>
          </button>
        </div>

        {/* Tree Laboratories Section */}
        <div className="space-y-2">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Laboratorios</p>
          
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
                    className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition ${
                      isLabActive && currentPath.endsWith("/info")
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div 
                        onClick={(e) => toggleNode(code, e)}
                        className="p-1 rounded hover:bg-slate-200/50 text-slate-400 transition"
                        title={isExpanded ? "Contraer" : "Expandir"}
                      >
                        <ChevronRight className={`w-3 h-3 flex-shrink-0 transition-transform ${isExpanded ? "transform rotate-90 text-slate-600" : ""}`} />
                      </div>
                      <span className="text-sm font-semibold truncate">
                        {code}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase font-bold tracking-tight">
                        {programAbbrev}
                      </span>
                      {lab.visible === false && (
                        <span title="Oculto para el público" className="text-[9px] bg-slate-200 text-slate-600 px-1 rounded uppercase">
                          Oculto
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nested Sub-nodes */}
                  {isExpanded && (
                    <div className="ml-6 mt-1 border-l border-slate-200 pl-2 space-y-1">
                      {/* Info sub-node */}
                      <button
                        onClick={() => handleNav(`/lab/${code}/info`)}
                        className={`w-full text-left px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
                          isActive(`/lab/${code}/info`)
                            ? "text-blue-600 font-medium bg-blue-50"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        Información General
                      </button>

                      {/* Equipos sub-node */}
                      <button
                        onClick={() => handleNav(`/lab/${code}/equipos`)}
                        className={`w-full text-left px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
                          isActive(`/lab/${code}/equipos`)
                            ? "text-blue-600 font-medium bg-blue-50"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        Equipos Técnicos
                      </button>

                      {/* Software sub-node */}
                      <button
                        onClick={() => handleNav(`/lab/${code}/software`)}
                        className={`w-full text-left px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
                          isActive(`/lab/${code}/software`)
                            ? "text-blue-600 font-medium bg-blue-50"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        Software & Licencias
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredLabs.length === 0 && (
              <div className="text-center py-4 text-slate-400 text-xs">
                Ningún ambiente encontrado.
              </div>
            )}
          </div>
        </div>

        {/* Footer info inside sidebar */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          {data.contacto?.visible !== false && data.contacto?.enlaces && (
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Enlaces Institucionales</p>
          )}
          
          <div className="space-y-0.5">
            {data.contacto?.enlaces?.slice(0, 3).map((link, idx) => (
              <a
                key={idx}
                href={link.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                <BookOpen className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
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
