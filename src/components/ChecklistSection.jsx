// ============================================
// ✅ COMPONENTE: ChecklistSection
// ============================================
// Muestra una sección del checklist con sus tareas.
// Cada tarea se puede marcar/desmarcar tocándola.
// Muestra el progreso de la sección (ej: 3/5).
//
// Uso: <ChecklistSection
//        section={seccionObj}
//        sectionIndex={0}
//        checkedTasks={objetoEstado}
//        onToggle={funcionToggle}
//      />
// ============================================

"use client";

export default function ChecklistSection({ section, sectionIndex, checkedTasks, onToggle }) {
  // Comprobar si TODAS las tareas de esta sección están hechas
  const allChecked = section.tasks.every(
    (_, i) => checkedTasks[`${sectionIndex}-${i}`]
  );

  // Contar cuántas están hechas
  const checkedCount = section.tasks.filter(
    (_, i) => checkedTasks[`${sectionIndex}-${i}`]
  ).length;

  return (
    <div
      className={`
        bg-tarjeta rounded-xl p-5 mb-4 border transition-colors duration-300
        ${allChecked ? "border-green-400/27" : "border-borde"}
      `}
    >
      {/* Cabecera de la sección */}
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-serif text-[17px] font-bold text-texto">
          {section.emoji} {section.section}
        </h4>
        <div className="flex items-center gap-2">
          {/* Tiempo de la sección (si existe) */}
          {section.sectionTime && (
            <span className="font-sans text-[11px] text-dorado bg-dorado/15 px-2 py-0.5 rounded-md font-semibold">
              {section.sectionTime}
            </span>
          )}
          {/* Contador de progreso */}
          <span
            className={`font-sans text-xs font-semibold ${
              allChecked ? "text-green-400" : "text-muted"
            }`}
          >
            {checkedCount}/{section.tasks.length}
          </span>
        </div>
      </div>

      {/* Lista de tareas */}
      {section.tasks.map((task, i) => {
        const key = `${sectionIndex}-${i}`;
        const checked = !!checkedTasks[key];

        return (
          <div
            key={i}
            onClick={() => onToggle(key)}
            className={`
              flex items-start gap-3 px-2 py-2.5 rounded-lg cursor-pointer
              transition-colors duration-200 mb-0.5
              ${checked ? "bg-green-400/10" : "bg-transparent"}
            `}
          >
            {/* Checkbox visual */}
            <div
              className={`
                w-[22px] h-[22px] min-w-[22px] rounded-md border-2
                flex items-center justify-center transition-all duration-200 mt-0.5
                ${checked
                  ? "border-green-400 bg-green-400"
                  : "border-sutil bg-transparent"
                }
              `}
            >
              {checked && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6L5 9L10 3"
                    stroke="#0A0E14"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>

            {/* Texto de la tarea */}
            <span
              className={`
                font-sans text-sm leading-relaxed flex-1 transition-all duration-200
                ${checked ? "text-muted line-through" : "text-texto"}
              `}
            >
              {task.text}
            </span>

            {/* Tiempo estimado */}
            <span className="font-sans text-[11px] text-sutil whitespace-nowrap mt-0.5">
              {task.time}
            </span>
          </div>
        );
      })}
    </div>
  );
}
