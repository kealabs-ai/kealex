export const fmt = (centavos: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(centavos / 100)

export const diasRestantes = (data: string) =>
  Math.ceil((new Date(data).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
