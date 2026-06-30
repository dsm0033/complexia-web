// Estilos por estado de reserva, compartidos por las vistas día / semana / mes.
export const ESTILO_ESTADO = {
  pagado:     { box: 'bg-emerald-50 border-emerald-300', dot: 'bg-emerald-500', txt: 'text-emerald-900', sub: 'text-emerald-700', label: 'Pagado online' },
  confirmado: { box: 'bg-blue-50 border-blue-300',       dot: 'bg-blue-500',    txt: 'text-blue-900',    sub: 'text-blue-700',    label: 'Pago en local' },
  pendiente:  { box: 'bg-amber-50 border-amber-300',     dot: 'bg-amber-500',   txt: 'text-amber-900',   sub: 'text-amber-700',   label: 'Pendiente de pago' },
}

export const estiloDe = estado => ESTILO_ESTADO[estado] ?? ESTILO_ESTADO.pendiente
