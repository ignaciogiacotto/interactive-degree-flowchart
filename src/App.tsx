import { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  MarkerType,
  type Edge,
  type Node
} from 'reactflow';
import 'reactflow/dist/style.css';

import { materiasData, type Materia } from './data/materias';
import MateriaNode from './components/MateriaNode';
import HeaderNode from './components/HeaderNode';
import { Moon, Sun, RotateCcw } from 'lucide-react';

const nodeTypes = {
  materia: MateriaNode,
  header: HeaderNode,
};

function App() {
  const [materias, setMaterias] = useState<Materia[]>(() => {
    const saved = localStorage.getItem('materias-progress');
    if (!saved) return materiasData;

    const savedProgress: Materia[] = JSON.parse(saved);
    // Mapeamos los datos frescos y les inyectamos el estado guardado
    return materiasData.map(materiaActual => {
      const progresoGuardado = savedProgress.find(p => p.id === materiaActual.id);
      return progresoGuardado 
        ? { ...materiaActual, estado: progresoGuardado.estado } 
        : materiaActual;
    });
  });
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    localStorage.setItem('materias-progress', JSON.stringify(materias));
  }, [materias]);

  const onStatusChange = useCallback((id: string) => {
    setMaterias((prev) => prev.map(m => {
      if (m.id === id) {
        const nextStatus: Materia['estado'][] = ['pendiente', 'regular', 'aprobada'];
        const currentIndex = nextStatus.indexOf(m.estado);
        const nextIndex = (currentIndex + 1) % nextStatus.length;
        return { ...m, estado: nextStatus[nextIndex] };
      }
      return m;
    }));
  }, []);

  const resetProgress = () => {
    if (window.confirm('¿Estás seguro de que quieres reiniciar todo tu progreso?')) {
      setMaterias(materiasData);
    }
  };

  const isUnlocked = useCallback((materia: Materia, allMaterias: Materia[]) => {
    const regularMet = materia.correlativas_regular.every(reqId => {
      const req = allMaterias.find(m => m.id === reqId);
      return req && (req.estado === 'regular' || req.estado === 'aprobada');
    });

    const finalMet = materia.correlativas_final.every(reqId => {
      const req = allMaterias.find(m => m.id === reqId);
      return req && req.estado === 'aprobada';
    });

    return regularMet && finalMet;
  }, []);

  const { nodes, edges } = useMemo(() => {
    const yearCounts: Record<number, number> = {};
    const years = Array.from(new Set(materias.map(m => m.anio))).sort((a, b) => a - b);
    
    // Header nodes for each year
    const headerNodes: Node[] = years.map(year => ({
      id: `header-${year}`,
      type: 'header',
      data: { label: `${year}° AÑO`, darkMode },
      position: { x: (year - 1) * 380, y: -80 },
      draggable: false,
    }));

    const materiaNodes: Node[] = materias.map((m) => {
      const year = m.anio;
      const index = yearCounts[year] || 0;
      yearCounts[year] = index + 1;

      return {
        id: m.id,
        type: 'materia',
        data: { 
          ...m, 
          onStatusChange, 
          isUnlocked: isUnlocked(m, materias),
          darkMode
        },
        position: { 
          x: (year - 1) * 380, 
          y: index * 85 
        },
      };
    });

    const newNodes = [...headerNodes, ...materiaNodes];

    const newEdges: Edge[] = [];
    materias.forEach(m => {
      const allPrereqs = [...new Set([...m.correlativas_regular, ...m.correlativas_final])];
      allPrereqs.forEach(reqId => {
        const targetUnlocked = isUnlocked(m, materias);
        newEdges.push({
          id: `e${reqId}-${m.id}`,
          source: reqId,
          target: m.id,
          animated: targetUnlocked,
          style: { 
            stroke: targetUnlocked 
              ? (darkMode ? '#6366f1' : '#3b82f6') 
              : (darkMode ? '#334155' : '#cbd5e1'),
            strokeWidth: 2
          },
          markerEnd: { 
            type: MarkerType.ArrowClosed, 
            color: targetUnlocked 
              ? (darkMode ? '#6366f1' : '#3b82f6') 
              : (darkMode ? '#334155' : '#cbd5e1')
          },
        });
      });
    });

    return { nodes: newNodes, edges: newEdges };
  }, [materias, onStatusChange, isUnlocked, darkMode]);

  return (
    <div className={`w-screen h-screen transition-colors ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header / Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
        </button>
        <button 
          onClick={resetProgress}
          className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:scale-110 transition-transform text-red-500"
          title="Reiniciar progreso"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="absolute top-4 right-4 z-10 text-right">
        <h1 className="text-xl font-bold tracking-tight">Organizador de Materias</h1>
        <p className="text-xs opacity-60">Ciencias de la Educación</p>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        edgesFocusable={false}
        edgesUpdatable={false}
        elementsSelectable={true}
        panOnScroll={true}
        selectionOnDrag={false}
      >
        <Background />
        <Controls />
        <MiniMap zoomable pannable />
      </ReactFlow>
    </div>
  );
}

export default App;
