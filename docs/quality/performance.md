# Rendimiento

1. Explica el síntoma y costo para usuario/operación.
2. Mide una línea base reproducible (comando, datos, dispositivo/red y fecha).
3. Identifica cuello de botella con evidencia.
4. Cambia una sola variable y vuelve a medir igual.
5. Conserva el cambio solo si supera la variación normal y la validación sigue verde; si no, reviértelo.
6. Registra cifra, decisión y protección contra regresión cuando el trabajo sea relevante.

Presupuestos iniciales: evitar N+1, paginar listas, comprimir/limitar medios, no descargar mapas o geometrías innecesarios y no bloquear interacción móvil con cálculos pesados. No añadir caché, memoización o dependencias sin perfil que lo justifique.
