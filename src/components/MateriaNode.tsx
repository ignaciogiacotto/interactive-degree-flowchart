import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import type { Materia } from '../data/materias';

const MateriaNode = ({ data }: NodeProps<Materia & { onStatusChange: (id: string) => void, isUnlocked: boolean, darkMode: boolean }>) => {
  const { nombre, estado, onStatusChange, isUnlocked, darkMode } = data;

  const getStyles = () => {
    if (!isUnlocked) {
      return darkMode 
        ? 'bg-slate-800 text-slate-500 border-slate-700 grayscale opacity-60' 
        : 'bg-gray-100 text-gray-400 border-gray-200 grayscale';
    }
    
    switch (estado) {
      case 'aprobada': 
        return darkMode 
          ? 'bg-green-900-30 text-green-400 border-green-800' 
          : 'bg-green-100 text-green-800 border-green-300';
      case 'regular': 
        return darkMode 
          ? 'bg-blue-900-30 text-blue-400 border-blue-800' 
          : 'bg-blue-100 text-blue-800 border-blue-300';
      default: 
        return darkMode 
          ? 'bg-slate-800 text-slate-100 border-slate-700' 
          : 'bg-white text-gray-800 border-gray-200';
    }
  };

  const renderIcon = () => {
    switch (estado) {
      case 'aprobada': return <CheckCircle size={20} className={darkMode ? 'text-green-400' : 'text-green-600'} />;
      case 'regular': return <Clock size={20} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />;
      default: return <Circle size={20} className={darkMode ? 'text-slate-500' : 'text-gray-400'} />;
    }
  };

  return (
    <div 
      className={`px-5 py-2 shadow-md rounded-xl border-2 transition-all cursor-pointer w-[350px] hover:scale-105 ${getStyles()}`}
      onClick={() => isUnlocked && onStatusChange(data.id)}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{ left: '-6px', width: '4px', height: '4px', background: darkMode ? '#475569' : '#64748b', border: 'none' }}
      />
      
      <div className="flex items-start gap-3">
        <div className="mt-1.5 shrink-0">{renderIcon()}</div>
        <div className="text-[25px] font-bold uppercase tracking-tight leading-[1.1] py-1 whitespace-normal break-words">
          {nombre}
        </div>
      </div>
      
      {!isUnlocked && (
        <div className="text-[14px] mt-1 italic opacity-70 flex items-center gap-1">
          Bloqueada
        </div>
      )}

      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ right: '-6px', width: '4px', height: '4px', background: darkMode ? '#475569' : '#64748b', border: 'none' }}
      />
    </div>
  );
};

export default memo(MateriaNode);
