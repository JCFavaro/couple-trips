import { useMemo } from 'react';
import { useGastos } from './useGastos';
import { usePaymentPlans } from './usePaymentPlans';

export interface BalanceUnificado {
  // Totales generales
  totalGeneral: number; // Todo lo gastado/pagado entre los dos
  totalJuan: number; // Todo lo que pagó Juan (gastos + cuotas)
  totalVale: number; // Todo lo que pagó Vale (gastos + cuotas)
  diferencia: number; // Cuánto debe uno al otro
  deudor: 'Juan' | 'Vale' | null; // Quién debe

  // Desglose por tipo
  gastos: {
    total: number;
    juan: number;
    vale: number;
  };
  pagos: {
    total: number;
    juan: number;
    vale: number;
  };

  // Planes de pago (total a pagar vs pagado)
  planesTotal: number; // Monto total de todos los planes
  planesPagado: number; // Lo que ya se pagó
  planesRestante: number; // Lo que falta
  planesProgreso: number; // Porcentaje 0-100
}

export function useBalance() {
  const { balance: balanceGastos, loading: loadingGastos } = useGastos();
  const { resumen: resumenPagos, loading: loadingPagos } = usePaymentPlans();

  const balanceUnificado = useMemo((): BalanceUnificado => {
    // Gastos (pagos inmediatos)
    const gastosJuan = balanceGastos.juan;
    const gastosVale = balanceGastos.vale;
    const gastosTotal = balanceGastos.total;

    // Pagos de planes (cuotas)
    const pagosJuan = resumenPagos.pagadoJuan;
    const pagosVale = resumenPagos.pagadoVale;
    const pagosTotal = resumenPagos.totalPagado;

    // Totales unificados
    const totalJuan = gastosJuan + pagosJuan;
    const totalVale = gastosVale + pagosVale;
    const totalGeneral = totalJuan + totalVale;

    // Cálculo de quién debe a quién
    // Cada uno debería haber pagado la mitad del total
    const diferencia = Math.abs(totalJuan - totalVale) / 2;
    let deudor: 'Juan' | 'Vale' | null = null;

    if (totalJuan > totalVale) {
      deudor = 'Vale'; // Vale le debe a Juan
    } else if (totalVale > totalJuan) {
      deudor = 'Juan'; // Juan le debe a Vale
    }

    return {
      totalGeneral: Number(totalGeneral.toFixed(2)),
      totalJuan: Number(totalJuan.toFixed(2)),
      totalVale: Number(totalVale.toFixed(2)),
      diferencia: Number(diferencia.toFixed(2)),
      deudor,

      gastos: {
        total: Number(gastosTotal.toFixed(2)),
        juan: Number(gastosJuan.toFixed(2)),
        vale: Number(gastosVale.toFixed(2)),
      },
      pagos: {
        total: Number(pagosTotal.toFixed(2)),
        juan: Number(pagosJuan.toFixed(2)),
        vale: Number(pagosVale.toFixed(2)),
      },

      planesTotal: Number(resumenPagos.totalAPagar.toFixed(2)),
      planesPagado: Number(resumenPagos.totalPagado.toFixed(2)),
      planesRestante: Number(resumenPagos.totalRestante.toFixed(2)),
      planesProgreso: resumenPagos.progresoGeneral,
    };
  }, [balanceGastos, resumenPagos]);

  return {
    balance: balanceUnificado,
    loading: loadingGastos || loadingPagos,
  };
}
