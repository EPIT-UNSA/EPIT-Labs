/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Menu, 
  Search, 
  X, 
  Sliders, 
  Download, 
  RotateCcw, 
  EyeOff,
  UploadCloud,
  ExternalLink,
  Info,
  ShieldAlert,
  AlertTriangle
} from "lucide-react";
import { EpitData, Lab, Equipo, normalizeData } from "./types";
import HomeView from "./components/HomeView";
import Sidebar from "./components/Sidebar";
import LabDetailView from "./components/LabDetailView";
import EquipmentDetailModal from "./components/EquipmentDetailModal";
import ImageZoomModal from "./components/ImageZoomModal";

const getInitialThemeMode = (): "light" | "dark" => {
  const saved = localStorage.getItem("epit-theme-mode");
  if (saved === "light" || saved === "dark") return saved;
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
};

const hexToRgb = (hex: string) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const darkenColor = (hex: string, percent: number) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const factor = 1 - percent / 100;
  const r = Math.max(0, Math.min(255, Math.floor(rgb.r * factor)));
  const g = Math.max(0, Math.min(255, Math.floor(rgb.g * factor)));
  const b = Math.max(0, Math.min(255, Math.floor(rgb.b * factor)));
  
  const toHex = (c: number) => {
    const h = c.toString(16);
    return h.length === 1 ? "0" + h : h;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export default function App() {
  // Theme state
  const [themeMode, setThemeMode] = useState<"light" | "dark">(getInitialThemeMode);
  const [themeColor, setThemeColor] = useState<string>(
    () => localStorage.getItem("epit-theme-color") || "#00a7d1"
  );

  // Apply theme mode class to documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("epit-theme-mode", themeMode);
  }, [themeMode]);

  // Apply theme color custom variables to documentElement
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--brand-primary", themeColor);
    
    // Hover color (darker version)
    const hoverColor = darkenColor(themeColor, 15);
    root.style.setProperty("--brand-hover", hoverColor);
    
    // Light and Border colors
    const rgb = hexToRgb(themeColor);
    if (rgb) {
      root.style.setProperty("--brand-light", `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${themeMode === "dark" ? "0.18" : "0.08"})`);
      root.style.setProperty("--brand-border", `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${themeMode === "dark" ? "0.35" : "0.2"})`);
    } else {
      root.style.setProperty("--brand-light", themeColor + (themeMode === "dark" ? "2d" : "14"));
      root.style.setProperty("--brand-border", themeColor + (themeMode === "dark" ? "59" : "33"));
    }
    
    localStorage.setItem("epit-theme-color", themeColor);
  }, [themeColor, themeMode]);

  // Global database states
  const [originalData, setOriginalData] = useState<EpitData | null>(null);
  const [editedData, setEditedData] = useState<EpitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Router State
  const [currentPath, setCurrentPath] = useState("/");
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});

  // UI interaction states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeEquipment, setActiveEquipment] = useState<{ labIndex: number; equipmentIndex: number } | null>(null);
  const [zoomGallery, setZoomGallery] = useState<{ images: string[]; initialIndex: number } | null>(null);

  const handleZoomImage = (images: string | string[], index: number = 0) => {
    const imagesArray = Array.isArray(images)
      ? images.filter(url => url && url !== "https://")
      : [images];
    const safeIndex = index >= 0 && index < imagesArray.length ? index : 0;
    setZoomGallery({ images: imagesArray, initialIndex: safeIndex });
  };

  // Search results dropdown ref for outside clicks
  const searchRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch initial data on mount
  useEffect(() => {
    fetch("./data.json")
      .then(res => {
        if (!res.ok) throw new Error("No se pudo descargar data.json de la raíz.");
        return res.json();
      })
      .then(data => {
        const normalized = normalizeData(data);
        setOriginalData(normalized);
        setEditedData(normalized);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("No se pudo cargar la base de datos de data.json de forma automática. Sube el archivo manualmente para iniciar.");
        setLoading(false);
      });
  }, []);

  // Custom Hash Router listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || "#/";
      const cleanHash = hash.startsWith("#") ? hash.slice(1) : hash;
      const [pathWithQuery, queryStr] = cleanHash.split("?");
      
      // Setup current route path
      const path = pathWithQuery || "/";
      setCurrentPath(path);

      // Parse hash query parameters
      const params: Record<string, string> = {};
      if (queryStr) {
        queryStr.split("&").forEach(param => {
          const [k, v] = param.split("=");
          params[k] = decodeURIComponent(v || "");
        });
      }

      // Also support window.location.search fallback
      const searchStr = window.location.search.slice(1);
      if (searchStr) {
        searchStr.split("&").forEach(param => {
          const [k, v] = param.split("=");
          params[k] = decodeURIComponent(v || "");
        });
      }

      setQueryParams(params);
    };

    // Trigger on load and hash change
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Handle outside clicks for search box
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  // Check if edit mode is globally active
  const isEditMode = useMemo(() => {
    return queryParams.edit === "true";
  }, [queryParams]);

  // Navigate helper that preserves the query parameters across routes
  const handleNavigate = (path: string) => {
    const hasEdit = isEditMode;
    const newHash = `#${path}${hasEdit ? "?edit=true" : ""}`;
    window.location.hash = newHash;
  };

  // Deep recursive immutable updater state
  const handleUpdate = (path: (string | number)[], value: any) => {
    if (!editedData) return;

    const setDeepValue = (obj: any, pathKeys: (string | number)[], val: any): any => {
      if (pathKeys.length === 0) return val;
      const [head, ...tail] = pathKeys;
      
      if (Array.isArray(obj)) {
        const newArr = [...obj];
        const index = typeof head === "string" ? parseInt(head, 10) : head;
        newArr[index] = setDeepValue(obj[index], tail, val);
        return newArr;
      } else {
        return {
          ...obj,
          [head]: setDeepValue(obj[head], tail, val)
        };
      }
    };

    setEditedData(prev => setDeepValue(prev, path, value));
  };

  // Global search compiler
  const searchResults = useMemo(() => {
    if (!editedData || globalSearch.trim().length < 2) return [];

    const results: {
      type: "lab" | "equipo" | "software" | "general" | "campo";
      title: string;
      subtitle: string;
      path: string;
      extra?: any;
    }[] = [];

    const query = globalSearch.toLowerCase();

    // Helper to check if string contains query
    const matches = (val: any): boolean => {
      if (val === null || val === undefined) return false;
      return String(val).toLowerCase().includes(query);
    };

    // 1. General University Fields (Home)
    const genFields = [
      { key: "NOMBRE DE LA UNIVERSIDAD", label: "Universidad" },
      { key: "ABREVIATURA UNIVERSIDAD", label: "Sigla Universidad" },
      { key: "FACULTAD", label: "Facultad" },
      { key: "ESCUELA", label: "Escuela" },
      { key: "PROGRAMA DE ESTUDIOS", label: "Programa de Estudios" },
      { key: "ABREVIATURA PROGRAMA DE ESTUDIOS", label: "Abreviatura Programa" },
      { key: "CODIGO PROGRAMA", label: "Código de Programa" },
      { key: "CODIGO LOCAL", label: "Código Local" }
    ];

    genFields.forEach(f => {
      const val = (editedData as any)[f.key];
      if (matches(val) || matches(f.label)) {
        results.push({
          type: "general",
          title: String(val || ""),
          subtitle: `${f.label} de la institución`,
          path: "/"
        });
      }
    });

    // 1.1 Directors
    if (Array.isArray(editedData["DIRECTOR DEL PROGRAMA DE ESTUDIOS"])) {
      editedData["DIRECTOR DEL PROGRAMA DE ESTUDIOS"].forEach(d => {
        if (d.visible === false && !isEditMode) return;
        if (matches(d.NOMBRE) || matches(d.Nombre) || matches(d.Periodo) || matches(d["NUMERO DE CONTACTO"]) || matches(d.CORREO)) {
          results.push({
            type: "general",
            title: d.NOMBRE || d.Nombre || "Director",
            subtitle: `Director de Programa • Periodo: ${d.Periodo || ""}`,
            path: "/"
          });
        }
      });
    }

    // 1.2 Departamento Académico
    const dept = editedData["DEPARTAMENTO ACADÉMICO"];
    if (dept && typeof dept === "object") {
      const typedDept = dept as any;
      if (typedDept.visible !== false || isEditMode) {
        if (matches(typedDept.NOMBRE)) {
          results.push({
            type: "general",
            title: typedDept.NOMBRE || "",
            subtitle: "Departamento Académico",
            path: "/"
          });
        }
        if (Array.isArray(typedDept.Director)) {
          typedDept.Director.forEach((d: any) => {
            if (d.visible === false && !isEditMode) return;
            if (matches(d.NOMBRE) || matches(d.Nombre) || matches(d.Periodo) || matches(d["NUMERO DE CONTACTO"]) || matches(d.CORREO)) {
              results.push({
                type: "general",
                title: d.NOMBRE || d.Nombre || "Director",
                subtitle: `Director de Depto. Académico • Periodo: ${d.Periodo || ""}`,
                path: "/"
              });
            }
          });
        }
      }
    }

    // 1.3 General Documents
    if (Array.isArray(editedData.documentos)) {
      editedData.documentos.forEach(doc => {
        if (matches(doc.titulo) || matches(doc.url)) {
          results.push({
            type: "general",
            title: doc.titulo,
            subtitle: `Documento general: ${doc.url}`,
            path: "/"
          });
        }
      });
    }

    // 2. Labs
    (editedData.labs || []).forEach((lab, labIdx) => {
      const isLabVisible = isEditMode || lab.visible !== false;
      if (!isLabVisible) return;

      const labCode = lab.infoAmbiente?.["CÓDIGO DE LABORATORIO O TALLER"] || "";
      const labName = lab.infoAmbiente?.["NOMBRE DEL LABORATORIO O TALLER"] || "";
      const labRef = `Lab: ${labName || labCode}`;

      // Check infoAmbiente fields
      const infoAmb = lab.infoAmbiente || {};
      const infoFields = [
        { key: "NUMERO DE LABORATORIO O TALLER", label: "Número de Laboratorio" },
        { key: "CÓDIGO DE LABORATORIO O TALLER", label: "Código de Laboratorio" },
        { key: "NOMBRE DEL LABORATORIO O TALLER", label: "Nombre de Laboratorio" },
        { key: "TIPO DE LABORATORIO O TALLER", label: "Tipo de Laboratorio" },
        { key: "CODIGO PATRIMONIO AMBIENTE", label: "Código Patrimonial Ambiente" },
        { key: "REFERENCIA DE UBICACIÓN", label: "Ubicación" },
        { key: "ÁREA (m2)", label: "Área" },
        { key: "AFORO", label: "Aforo" },
        { key: "COMENTARIOS", label: "Comentarios" }
      ];

      infoFields.forEach(f => {
        const val = (infoAmb as any)[f.key];
        if (matches(val)) {
          results.push({
            type: "lab",
            title: `${f.label}: ${val}`,
            subtitle: labRef,
            path: `/lab/${labCode}/info`
          });
        }
      });

      // Programs that use lab
      const programs = infoAmb["PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER"];
      if (Array.isArray(programs)) {
        programs.forEach(prog => {
          if (matches(prog)) {
            results.push({
              type: "lab",
              title: `Programa: ${prog}`,
              subtitle: `Usa el ${labRef}`,
              path: `/lab/${labCode}/info`
            });
          }
        });
      }

      // Responsable
      const resp = infoAmb["RESPONSABLE DEL LABORATORIO O TALLER"];
      if (resp && (resp.visible !== false || isEditMode)) {
        if (matches(resp.NOMBRE) || matches(resp["NUMERO DE CONTACTO"]) || matches(resp.CORREO)) {
          results.push({
            type: "lab",
            title: resp.NOMBRE || "Responsable",
            subtitle: `Responsable del ${labRef}`,
            path: `/lab/${labCode}/info`
          });
        }
      }

      // Personal Técnico
      if (Array.isArray(infoAmb["PERSONAL TÉCNICO"])) {
        infoAmb["PERSONAL TÉCNICO"].forEach(t => {
          if (t.visible === false && !isEditMode) return;
          if (matches(t.NOMBRE) || matches(t["NUMERO DE CONTACTO"]) || matches(t.CORREO)) {
            results.push({
              type: "lab",
              title: t.NOMBRE || "Personal Técnico",
              subtitle: `Personal Técnico del ${labRef}`,
              path: `/lab/${labCode}/info`
            });
          }
        });
      }

      // CBC Verification staff
      const cbc = infoAmb["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"];
      if (cbc && (cbc.visible !== false || isEditMode)) {
        if (matches(cbc.NOMBRE) || matches(cbc["NUMERO DE CONTACTO"]) || matches(cbc.CORREO)) {
          results.push({
            type: "lab",
            title: cbc.NOMBRE || "Verificador CBC III",
            subtitle: `Personal Verificador CBC III en ${labRef}`,
            path: `/lab/${labCode}/info`
          });
        }
      }

      // Lab documents
      if (Array.isArray(infoAmb.documentos)) {
        infoAmb.documentos.forEach(doc => {
          if (matches(doc.titulo) || matches(doc.url)) {
            results.push({
              type: "lab",
              title: doc.titulo,
              subtitle: `Documento de ${labRef}`,
              path: `/lab/${labCode}/info`
            });
          }
        });
      }

      // Equipos
      (lab.equipos || []).forEach((eq, eqIdx) => {
        const isEqVisible = isEditMode || eq.visible !== false;
        if (!isEqVisible) return;

        const eqName = eq["NOMBRE DEL EQUIPO"] || eq["NOMBRE DEL_EQUIPO"] || "";
        const eqRef = `Equipo: ${eqName} (en ${labCode})`;

        if (matches(eqName) || matches(eq.COMENTARIOS)) {
          results.push({
            type: "equipo",
            title: eqName,
            subtitle: `${eq.COMENTARIOS || "Equipo de laboratorio"} • ${labRef}`,
            path: `/lab/${labCode}/equipos`,
            extra: { labIdx, eqIdx }
          });
        }

        // infoEquipo fields
        const infoEq = eq.infoEquipo || {};
        const infoEqFields = [
          { key: "Denominacion Patrimonial", label: "Denominación Patrimonial" },
          { key: "Tipo de equipo:", label: "Tipo de Equipo" },
          { key: "Fabricante", label: "Fabricante" },
          { key: "Marca", label: "Marca" },
          { key: "Modelo", label: "Modelo" },
          { key: "Dimensiones", label: "Dimensiones" },
          { key: "Codigo Inventario Equipo", label: "Código Inventario" },
          { key: "FECHA DE ADQUISICIÓN", label: "Fecha de Adquisición" },
          { key: "MODO DE ADQUISICIÓN", label: "Modo de Adquisición" },
          { key: "Ubicación", label: "Ubicación interna" }
        ];

        infoEqFields.forEach(f => {
          const val = (infoEq as any)[f.key];
          if (matches(val)) {
            results.push({
              type: "equipo",
              title: `${f.label}: ${val}`,
              subtitle: eqRef,
              path: `/lab/${labCode}/equipos`,
              extra: { labIdx, eqIdx }
            });
          }
        });

        // características
        if (Array.isArray(eq.caracteristicas)) {
          eq.caracteristicas.forEach(c => {
            if (matches(c.Caracteristica) || matches(c.Descripcion)) {
              results.push({
                type: "equipo",
                title: `${c.Caracteristica || "Característica"}: ${c.Descripcion || ""}`,
                subtitle: eqRef,
                path: `/lab/${labCode}/equipos`,
                extra: { labIdx, eqIdx }
              });
            }
          });
        }

        // ProcedimientoMantenimiento
        const pm = eq.ProcedimientoMantenimiento || {};
        if (pm.visible !== false || isEditMode) {
          if (matches(pm["Principio de Operacion"])) {
            results.push({
              type: "equipo",
              title: "Principio de Operación",
              subtitle: eqRef,
              path: `/lab/${labCode}/equipos`,
              extra: { labIdx, eqIdx }
            });
          }
          if (matches(pm["Instalaciones Requeridas"])) {
            results.push({
              type: "equipo",
              title: "Instalaciones Requeridas",
              subtitle: eqRef,
              path: `/lab/${labCode}/equipos`,
              extra: { labIdx, eqIdx }
            });
          }
          if (matches(pm.Partes)) {
            results.push({
              type: "equipo",
              title: "Partes/Módulos del Equipo",
              subtitle: eqRef,
              path: `/lab/${labCode}/equipos`,
              extra: { labIdx, eqIdx }
            });
          }
        }

        // HojasDeVidaEquipos
        if (Array.isArray(eq.HojasDeVidaEquipos)) {
          eq.HojasDeVidaEquipos.forEach(hv => {
            if (hv.visible === false && !isEditMode) return;
            if (matches(hv.nota) || matches(hv.HechoPor) || matches(hv.RevisadoPor)) {
              results.push({
                type: "equipo",
                title: `Hoja de Vida: ${hv.nota || "Detalle"}`,
                subtitle: eqRef,
                path: `/lab/${labCode}/equipos`,
                extra: { labIdx, eqIdx }
              });
            }

            // hv infoEquipo
            const hvInfo = hv.infoEquipo || {};
            const hvInfoFields = [
              { key: "N° de serie", label: "N° de Serie" },
              { key: "Codigo Patrimonial", label: "Código Patrimonial" },
              { key: "Año Fabricación", label: "Año de Fabricación" },
              { key: "Estado de conservación", label: "Estado de Conservación" },
              { key: "Estado de uso", label: "Estado de Uso" }
            ];
            hvInfoFields.forEach(f => {
              const val = (hvInfo as any)[f.key];
              if (matches(val)) {
                results.push({
                  type: "equipo",
                  title: `Hoja Vida • ${f.label}: ${val}`,
                  subtitle: eqRef,
                  path: `/lab/${labCode}/equipos`,
                  extra: { labIdx, eqIdx }
                });
              }
            });

            // hv mantenimientos log
            if (Array.isArray(hv.mantenimientos)) {
              hv.mantenimientos.forEach(m => {
                if (m.visible === false && !isEditMode) return;
                if (matches(m["Actividad realizada"]) || matches(m.Responsable) || matches(m.Observaciones)) {
                  results.push({
                    type: "equipo",
                    title: `Mantenimiento: ${m["Actividad realizada"] || "Actividad"}`,
                    subtitle: `${eqRef} • Obs: ${m.Observaciones || ""}`,
                    path: `/lab/${labCode}/equipos`,
                    extra: { labIdx, eqIdx }
                  });
                }
              });
            }
          });
        }
      });

      // Software
      (lab.software || []).forEach(sw => {
        const isSwVisible = isEditMode || sw.visible !== false;
        if (!isSwVisible) return;

        const swName = sw["NOMBRE DEL SOFTWARE"] || "";
        const swRef = `Software: ${swName} (en ${labCode})`;

        if (matches(swName) || matches(sw["TIPO DE LICENCIA"]) || matches(sw.VERSIÓN) || matches(sw.COMENTARIOS)) {
          results.push({
            type: "software",
            title: swName,
            subtitle: `Licencia: ${sw["TIPO DE LICENCIA"] || ""} | Versión: ${sw.VERSIÓN || ""} • ${labRef}`,
            path: `/lab/${labCode}/software`
          });
        }
      });
    });

    // Deduplicate results by path + title + subtitle
    const seen = new Set<string>();
    const uniqueResults = results.filter(r => {
      const key = `${r.path}-${r.title}-${r.subtitle}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return uniqueResults.slice(0, 10); // Max 10 matches
  }, [editedData, globalSearch, isEditMode]);

  // Export JSON payload trigger
  const handleExportJSON = () => {
    if (!editedData) return;
    const dataStr = JSON.stringify(editedData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Revert changes back to server default
  const handleReset = () => {
    if (window.confirm("¿Estás seguro de que deseas restablecer todos los cambios locales?")) {
      setEditedData(JSON.parse(JSON.stringify(originalData)));
    }
  };

  // Manual file upload parsing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = normalizeData(JSON.parse(event.target?.result as string));
        setOriginalData(parsed);
        setEditedData(parsed);
        setError(null);
        alert("¡Base de datos JSON cargada con éxito!");
      } catch (err) {
        alert("Error al cargar JSON: Verifique que el formato y codificación sean correctos.");
      }
    };
    reader.readAsText(file);
  };

  // Route matches
  const matchedRoute = useMemo(() => {
    if (!editedData) return { view: "loading" };

    if (currentPath === "/" || currentPath === "") {
      return { view: "home" };
    }

    // Matches e.g. /lab/SL01LA101/info or /lab/SL01LA101/equipos or /lab/SL01LA101/software
    const labMatch = currentPath.match(/^\/lab\/([^/]+)\/?([^/]*)/);
    if (labMatch) {
      const labId = labMatch[1];
      const tab = labMatch[2] || "info"; // default to info
      
      const labIndex = (editedData.labs || []).findIndex(
        l => l.infoAmbiente?.["CÓDIGO DE LABORATORIO O TALLER"] === labId
      );

      if (labIndex !== -1) {
        const labObj = editedData.labs[labIndex];
        // Ensure subSection is valid
        const subSection = (tab === "equipos" || tab === "software") ? tab : "info";
        return { 
          view: "lab-detail", 
          lab: labObj, 
          labIndex, 
          subSection 
        };
      }
    }

    return { view: "not-found" };
  }, [editedData, currentPath]);

  // Loading Screen Render
  if (loading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-theme-page font-sans gap-4 transition-colors duration-200">
        <div className="w-12 h-12 border-4 border-theme-brand border-t-transparent rounded-full animate-spin"></div>
        <p className="text-theme-text-muted font-mono text-xs tracking-widest animate-pulse">CARGANDO EPIT LABS WIKI...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-page flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-30 bg-theme-card text-theme-text-primary border-b border-theme-border-light shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Hamburguer toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-theme-text-tertiary hover:text-theme-text-primary hover:bg-theme-hover transition cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div 
              onClick={() => handleNavigate("/")}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-8 h-8 rounded bg-theme-brand flex items-center justify-center font-display font-extrabold text-white text-sm shadow transition duration-300 group-hover:bg-theme-brand-hover">
                U
              </div>
              <div className="hidden sm:block">
                <span className="text-xs font-bold text-theme-text-tertiary tracking-widest uppercase block">EPIT Labs</span>
                <span className="text-sm font-bold text-theme-text-primary block -mt-1">UNSA Wiki</span>
              </div>
            </div>
          </div>

          {/* Interactive Global Search Bar */}
          <div className="flex-1 max-w-md relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-theme-text-tertiary" />
              <input
                type="text"
                className="w-full bg-theme-page border border-theme-border-medium rounded-lg pl-10 pr-4 py-2 text-xs text-theme-text-primary placeholder-theme-text-tertiary focus:outline-none focus:border-theme-brand focus:ring-1 focus:ring-theme-brand transition-colors duration-200"
                placeholder="Buscar equipos, laboratorios, software..."
                value={globalSearch}
                onFocus={() => setShowSearchResults(true)}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  setShowSearchResults(true);
                }}
              />
              {globalSearch && (
                <button 
                  onClick={() => setGlobalSearch("")}
                  className="absolute right-3 top-2.5 text-theme-text-tertiary hover:text-theme-text-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Results popup */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-theme-card border border-theme-border-medium rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1 divide-y divide-theme-border-light transition-colors duration-200">
                {searchResults.map((res, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setShowSearchResults(false);
                      setGlobalSearch("");
                      handleNavigate(res.path);
                      if (res.type === "equipo" && res.extra) {
                        setActiveEquipment({
                          labIndex: res.extra.labIdx,
                          equipmentIndex: res.extra.eqIdx
                        });
                      }
                    }}
                    className="p-2.5 hover:bg-theme-hover rounded-lg flex flex-col gap-0.5 cursor-pointer transition text-left"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-theme-text-primary truncate max-w-[80%]">{res.title}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-mono font-bold tracking-wider shrink-0 bg-theme-brand-light text-theme-brand border border-theme-brand-border">
                        {res.type}
                      </span>
                    </div>
                    <span className="text-[10px] text-theme-text-muted truncate">{res.subtitle}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action links */}
          <div className="flex items-center gap-3">
            {isEditMode ? (
              <div className="hidden md:flex items-center gap-1.5 bg-theme-brand-light border border-theme-brand-border px-3 py-1.5 rounded-lg text-xs font-bold text-theme-brand">
                <span className="w-2 h-2 rounded-full bg-theme-brand animate-pulse"></span>
                MODO EDICIÓN ACTIVO
              </div>
            ) : (
              <div className="hidden md:block text-xs font-semibold text-theme-text-tertiary tracking-wider font-mono uppercase">
                Portal UNSA • EPIT
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Structural Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
        
        {/* Layout: Sidebar and main content area */}
        {editedData && (
          <Sidebar
            data={editedData}
            currentPath={currentPath}
            isEditMode={isEditMode}
            isMobileOpen={isSidebarOpen}
            onCloseMobile={() => setIsSidebarOpen(false)}
            onNavigate={handleNavigate}
            themeMode={themeMode}
            onThemeModeChange={setThemeMode}
            themeColor={themeColor}
            onThemeColorChange={setThemeColor}
            onResetThemeColor={() => setThemeColor("#00a7d1")}
          />
        )}

        {/* Main Content View Switcher */}
        <main className="flex-1 min-w-0 bg-theme-card rounded-2xl border border-theme-border-light p-6 md:p-8 shadow-sm transition-colors duration-200">
          {error ? (
            <div className="py-12 flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-6">
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-full">
                <AlertTriangle className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-display font-bold text-theme-text-primary">Servidor sin Base de Datos</h2>
                <p className="text-xs text-theme-text-muted leading-relaxed">
                  {error}
                </p>
              </div>

              {/* Upload fallback zone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-theme-border-medium rounded-xl p-8 bg-theme-page hover:bg-theme-hover transition cursor-pointer flex flex-col items-center justify-center gap-3 group"
              >
                <UploadCloud className="w-8 h-8 text-theme-text-tertiary group-hover:text-theme-brand transition" />
                <div>
                  <span className="text-xs font-bold text-theme-text-secondary block">Subir archivo data.json</span>
                  <span className="text-[10px] text-theme-text-tertiary font-mono mt-0.5 block">Formatos admitidos: JSON de EPIT</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {matchedRoute.view === "home" && editedData && (
                <HomeView
                  data={editedData}
                  isEditMode={isEditMode}
                  onUpdate={handleUpdate}
                  onNavigate={handleNavigate}
                  onZoomImage={handleZoomImage}
                />
              )}

              {matchedRoute.view === "lab-detail" && editedData && matchedRoute.lab && (
                <LabDetailView
                  lab={matchedRoute.lab}
                  labIndex={matchedRoute.labIndex!}
                  subSection={matchedRoute.subSection as any}
                  isEditMode={isEditMode}
                  onUpdate={handleUpdate}
                  onNavigate={handleNavigate}
                  onZoomImage={handleZoomImage}
                  onOpenEquipment={(eqIdx) => {
                    setActiveEquipment({
                      labIndex: matchedRoute.labIndex!,
                      equipmentIndex: eqIdx
                    });
                  }}
                />
              )}

              {matchedRoute.view === "not-found" && (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                  <span className="text-3xl font-display font-extrabold text-theme-text-tertiary">404</span>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-theme-text-primary text-base">Ruta no Encontrada</h3>
                    <p className="text-xs text-theme-text-tertiary">El ambiente o sección solicitado no existe en la base de datos de EPIT.</p>
                  </div>
                  <button
                    onClick={() => handleNavigate("/")}
                    className="mt-4 px-4 py-2 bg-theme-brand hover:bg-theme-brand-hover text-white text-xs font-semibold rounded-lg transition"
                  >
                    Volver al Inicio
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Invisible file input for manual uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json"
        className="hidden"
      />

      {/* Immersive technical profile modal sheet */}
      {activeEquipment && editedData && editedData.labs?.[activeEquipment.labIndex]?.equipos?.[activeEquipment.equipmentIndex] && (
        <EquipmentDetailModal
          equipment={editedData.labs[activeEquipment.labIndex].equipos[activeEquipment.equipmentIndex]}
          isEditMode={isEditMode}
          onClose={() => setActiveEquipment(null)}
          onUpdateEquipment={(updatedEq) => {
            handleUpdate(["labs", activeEquipment.labIndex, "equipos", activeEquipment.equipmentIndex], updatedEq);
          }}
          onZoomImage={handleZoomImage}
        />
      )}

      {/* Bottom Floating Administrative Toolbar (Edit Mode) */}
      {isEditMode && editedData && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-950 text-white rounded-full px-6 py-3.5 flex items-center gap-4 shadow-2xl border border-slate-800 animate-slide-up w-[90vw] max-w-xl justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-theme-brand animate-pulse"></div>
            <span className="text-xs font-mono font-bold tracking-wide text-slate-300">Panel Admin</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Import uploader button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-full text-slate-300 hover:text-white transition cursor-pointer"
              title="Importar un data.json existente"
            >
              <UploadCloud className="w-4 h-4" />
            </button>

            {/* Reset state changes */}
            <button
              onClick={handleReset}
              className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-full text-slate-300 hover:text-white transition cursor-pointer"
              title="Restablecer todos los cambios"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Revert parameters and close mode */}
            <button
              onClick={() => {
                const hash = window.location.hash || "#/";
                const [path] = hash.slice(1).split("?");
                window.location.hash = `#${path}`;
              }}
              className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-full text-red-400 hover:text-red-300 transition cursor-pointer"
              title="Cerrar Modo Edición"
            >
              <X className="w-4 h-4" />
            </button>

            {/* MAIN EXPORT TRIGGER */}
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 bg-theme-brand hover:bg-theme-brand-hover text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow border border-theme-brand-border transition duration-200 cursor-pointer"
              title="Descargar data.json modificado para sobreescribir el archivo en GitHub"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar JSON</span>
            </button>
          </div>
        </div>
      )}
      {zoomGallery && (
        <ImageZoomModal
          images={zoomGallery.images}
          initialIndex={zoomGallery.initialIndex}
          onClose={() => setZoomGallery(null)}
        />
      )}
    </div>
  );
}
