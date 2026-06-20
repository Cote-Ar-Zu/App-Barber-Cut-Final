# BarberCut ABC

Analizador de servicios para barberías y estéticas, basado en clasificación ABC (Ley de Pareto).

## Flujo de uso

1. **Ingreso de barberos**: al entrar, se solicita el nombre de cada barbero/estilista del local.
2. **Carga de ventas**: se sube un CSV con las ventas, o se descarga una plantilla precargada con los nombres ya ingresados.
3. **Dashboard**: se muestra el análisis ABC (curva de Pareto, resumen de ingresos, tabla de servicios) y se puede exportar el archivo de vuelta.

## Formato del CSV

```
sku,nombre_servicio,costo_unitario,precio_venta,barbero,unidades_vendidas
001,Corte de Cabello Tradicional,4500,15000,Carlos Soto,99
```

Cada fila representa las ventas de **un servicio realizado por un barbero específico**. Si cuatro barberos venden el mismo servicio, hay cuatro filas con el mismo `sku` pero distinto `barbero`.

## Desarrollo

```
npm install
npm run dev
```
